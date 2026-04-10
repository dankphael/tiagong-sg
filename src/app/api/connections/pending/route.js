import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'userId is required' }, { status: 400 });
    }

    // Get pending requests where current user is the receiver
    const result = await query(
      `SELECT 
        c.id, c.requester_id, c.receiver_id, c.status, c.created_at,
        u.first_name, u.last_name, u.email, u.dialect_group, u.age, u.occupation,
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
