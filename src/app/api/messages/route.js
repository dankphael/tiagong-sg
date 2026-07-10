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

    let sql = `SELECT id, connection_id, sender_id, type, body, metadata, created_at, read_at
      FROM messages WHERE connection_id = $1`;
    const params = [connectionId];
    if (sinceId) {
      sql += ` AND id > $2`;
      params.push(sinceId);
    }
    sql += ` ORDER BY id ASC`;

    const result = await query(sql, params);

    await query(
      `UPDATE messages SET read_at = CURRENT_TIMESTAMP
       WHERE connection_id = $1 AND sender_id != $2 AND read_at IS NULL`,
      [connectionId, decoded.userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching messages:', err);
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST {connectionId, type, body, metadata} — send a message or meetup proposal.
export async function POST(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

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
