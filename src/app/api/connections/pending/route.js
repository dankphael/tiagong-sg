import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const userId = auth.decoded.userId;

    // Get pending requests where current user is the receiver
    const result = await query(
      `SELECT
        c.id, c.requester_id, c.receiver_id, c.status, c.message, c.created_at,
        u.first_name, u.last_name, u.role, u.age, u.occupation,
        u.dialect_group as language_interest,
        u.first_name || ' ' || u.last_name as requester_name
       FROM connections c
       JOIN users u ON c.requester_id = u.id
       WHERE c.receiver_id = $1 AND c.status = 'pending'
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return Response.json({ error: 'Failed to fetch pending requests' }, { status: 500 });
  }
}
