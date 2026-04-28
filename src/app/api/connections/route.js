import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// POST: Send a connection request
export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { requesterId, receiverId, message } = await req.json();

    if (!requesterId || !receiverId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (requesterId === receiverId) {
      return Response.json({ error: 'Cannot connect with yourself' }, { status: 400 });
    }

    // Check if connection already exists
    const existingConnection = await query(
      `SELECT id, status FROM connections
       WHERE (requester_id = $1 AND receiver_id = $2)
       OR (requester_id = $2 AND receiver_id = $1)`,
      [requesterId, receiverId]
    );

    if (existingConnection.rows.length > 0) {
      const existing = existingConnection.rows[0];
      if (existing.status === 'pending') {
        return Response.json({ error: 'Connection request already pending' }, { status: 409 });
      }
      if (existing.status === 'accepted') {
        return Response.json({ error: 'Already connected' }, { status: 409 });
      }
      // Rejected — flip back to pending so the unique constraint doesn't block resend
      if (existing.status === 'rejected') {
        const updated = await query(
          `UPDATE connections SET status='pending', message=$1, updated_at=CURRENT_TIMESTAMP
           WHERE id=$2
           RETURNING id, requester_id, receiver_id, status, message, created_at`,
          [message || null, existing.id]
        );
        return Response.json(updated.rows[0], { status: 200 });
      }
    }

    // Create new connection request
    const result = await query(
      `INSERT INTO connections (requester_id, receiver_id, status, message)
       VALUES ($1, $2, 'pending', $3)
       RETURNING id, requester_id, receiver_id, status, message, created_at`,
      [requesterId, receiverId, message || null]
    );

    return Response.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return Response.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}

// GET: Fetch user's connections
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

    // Get all connections for this user (both as requester and receiver)
    const result = await query(
      `SELECT
        c.id, c.requester_id, c.receiver_id, c.status, c.message, c.created_at,
        CASE
          WHEN c.requester_id = $1 THEN u2.first_name || ' ' || u2.last_name
          ELSE u1.first_name || ' ' || u1.last_name
        END as connected_user_name,
        CASE
          WHEN c.requester_id = $1 THEN u2.email
          ELSE u1.email
        END as connected_user_email,
        CASE
          WHEN c.requester_id = $1 THEN u2.id
          ELSE u1.id
        END as connected_user_id,
        CASE
          WHEN c.requester_id = $1 THEN u2.role
          ELSE u1.role
        END as connected_user_role,
        CASE
          WHEN c.requester_id = $1 THEN u2.language_interest
          ELSE u1.language_interest
        END as connected_user_dialect
       FROM connections c
       JOIN users u1 ON c.requester_id = u1.id
       JOIN users u2 ON c.receiver_id = u2.id
       WHERE c.requester_id = $1 OR c.receiver_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return Response.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}
