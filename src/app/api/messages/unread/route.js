import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET → [{connection_id, unread_count}] across all of the user's accepted
// connections, for chat badges.
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT m.connection_id, COUNT(*)::int AS unread_count
       FROM messages m
       JOIN connections c ON m.connection_id = c.id
       WHERE (c.requester_id = $1 OR c.receiver_id = $1)
       AND c.status = 'accepted'
       AND m.sender_id != $1
       AND m.read_at IS NULL
       GROUP BY m.connection_id`,
      [decoded.userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching unread counts:', err);
    return Response.json({ error: 'Failed to fetch unread counts' }, { status: 500 });
  }
}
