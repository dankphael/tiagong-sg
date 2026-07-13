import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

const VALID_TYPES = ['text', 'meetup_proposal'];

async function getConnectionIfParticipant(connectionId, userId) {
  const result = await query(
    `SELECT id, requester_id, receiver_id, status FROM connections WHERE id = $1`,
    [connectionId]
  );
  if (result.rows.length === 0) return null;
  const connection = result.rows[0];
  if (connection.requester_id !== userId && connection.receiver_id !== userId) return null;
  return connection;
}

// GET ?connectionId&sinceId — fetch messages for a connection's thread,
// optionally only those after sinceId (for polling). Marks the other
// participant's messages as read.
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get('connectionId');
    const sinceId = searchParams.get('sinceId');

    if (!connectionId) {
      return Response.json({ error: 'connectionId is required' }, { status: 400 });
    }

    const connection = await getConnectionIfParticipant(connectionId, decoded.userId);
    if (!connection) {
      return Response.json({ error: 'Connection not found or not authorized' }, { status: 404 });
    }
    if (connection.status !== 'accepted') {
      return Response.json({ error: 'Chat is only available for accepted connections' }, { status: 403 });
    }

    let rows;
    if (sinceId) {
      // Polling for new messages only — the thread is already loaded client-side.
      const result = await query(
        `SELECT id, connection_id, sender_id, type, body, metadata, created_at, read_at
         FROM messages WHERE connection_id = $1 AND id > $2 ORDER BY id ASC`,
        [connectionId, sinceId]
      );
      rows = result.rows;
    } else {
      // Initial load — cap history so long-lived threads don't return an
      // unbounded payload; fetch newest 200 then restore chronological order.
      const result = await query(
        `SELECT id, connection_id, sender_id, type, body, metadata, created_at, read_at
         FROM messages WHERE connection_id = $1 ORDER BY id DESC LIMIT 200`,
        [connectionId]
      );
      rows = result.rows.reverse();
    }

    const hasUnread = rows.some(r => r.sender_id !== decoded.userId && r.read_at == null);
    if (hasUnread) {
      await query(
        `UPDATE messages SET read_at = CURRENT_TIMESTAMP
         WHERE connection_id = $1 AND sender_id != $2 AND read_at IS NULL`,
        [connectionId, decoded.userId]
      );
    }

    return Response.json(rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

const MAX_BODY_BYTES = 64_000; // generous ceiling for a ≤1000 char message plus metadata

// POST {connectionId, type, body, metadata} — send a message or meetup proposal.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  const contentLength = Number(req.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: 'Request body too large' }, { status: 413 });
  }

  try {
    const { connectionId, type = 'text', body, metadata } = await req.json();

    if (!connectionId) {
      return Response.json({ error: 'connectionId is required' }, { status: 400 });
    }
    if (!VALID_TYPES.includes(type)) {
      return Response.json({ error: 'Invalid message type' }, { status: 400 });
    }
    if (body != null && body.length > 1000) {
      return Response.json({ error: 'Message body too long (max 1000 characters)' }, { status: 400 });
    }

    const connection = await getConnectionIfParticipant(connectionId, decoded.userId);
    if (!connection) {
      return Response.json({ error: 'Connection not found or not authorized' }, { status: 404 });
    }
    if (connection.status !== 'accepted') {
      return Response.json({ error: 'Chat is only available for accepted connections' }, { status: 403 });
    }

    const recent = await query(
      `SELECT id FROM messages WHERE connection_id = $1 AND sender_id = $2
       AND created_at > NOW() - INTERVAL '1 second' LIMIT 1`,
      [connectionId, decoded.userId]
    );
    if (recent.rows.length > 0) {
      return Response.json({ error: 'Sending too fast — please slow down' }, { status: 429 });
    }

    let finalMetadata = metadata || {};
    if (type === 'meetup_proposal') {
      if (!metadata?.date || !metadata?.place) {
        return Response.json({ error: 'Meetup proposals require a date and place' }, { status: 400 });
      }
      finalMetadata = { ...metadata, status: 'proposed' };
    }

    const result = await query(
      `INSERT INTO messages (connection_id, sender_id, type, body, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, connection_id, sender_id, type, body, metadata, created_at, read_at`,
      [connectionId, decoded.userId, type, body || null, JSON.stringify(finalMetadata)]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error('Error sending message:', err);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
