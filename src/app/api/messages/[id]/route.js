import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// PATCH {action: 'accept_meetup'|'decline_meetup'} — respond to a meetup
// proposal. Only the non-sender participant may respond, and only while
// the proposal is still 'proposed'.
export async function PATCH(req, { params }) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!['accept_meetup', 'decline_meetup'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    const result = await query(
      `SELECT m.id, m.type, m.sender_id, m.metadata, c.requester_id, c.receiver_id
       FROM messages m JOIN connections c ON m.connection_id = c.id
       WHERE m.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return Response.json({ error: 'Message not found' }, { status: 404 });
    }
    const message = result.rows[0];

    if (message.requester_id !== decoded.userId && message.receiver_id !== decoded.userId) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }
    if (message.sender_id === decoded.userId) {
      return Response.json({ error: 'Cannot respond to your own proposal' }, { status: 403 });
    }
    if (message.type !== 'meetup_proposal') {
      return Response.json({ error: 'Not a meetup proposal' }, { status: 400 });
    }
    if (message.metadata?.status !== 'proposed') {
      return Response.json({ error: 'This proposal has already been responded to' }, { status: 409 });
    }

    const newStatus = action === 'accept_meetup' ? 'accepted' : 'declined';
    const updated = await query(
      `UPDATE messages SET metadata = metadata || $1::jsonb WHERE id = $2
       RETURNING id, connection_id, sender_id, type, body, metadata, created_at, read_at`,
      [JSON.stringify({ status: newStatus }), id]
    );

    return Response.json(updated.rows[0], { status: 200 });
  } catch (err) {
    console.error('Error updating message:', err);
    return Response.json({ error: 'Failed to update message' }, { status: 500 });
  }
}
