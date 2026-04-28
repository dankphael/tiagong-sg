import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const { action } = await req.json(); // 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Get the connection
    const connectionResult = await query(
      'SELECT * FROM connections WHERE id = $1',
      [id]
    );

    if (connectionResult.rows.length === 0) {
      return Response.json({ error: 'Connection not found' }, { status: 404 });
    }

    const connection = connectionResult.rows[0];

    // Verify the current user is the receiver
    if (connection.receiver_id !== auth.decoded.userId) {
      return Response.json({ error: 'Not authorized to respond to this request' }, { status: 403 });
    }

    // Update connection status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const result = await query(
      `UPDATE connections 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, requester_id, receiver_id, status, updated_at`,
      [newStatus, id]
    );

    return Response.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating connection:', error);
    return Response.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}
