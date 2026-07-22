import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// GET — pending custodian applications, for the admin console
export async function GET(req) {
  const { error, status } = await requireAdmin(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT a.id, a.user_id, a.dialects, a.background, a.credentials, a.huay_kuan, a.status, a.created_at,
       u.first_name, u.last_name, u.email
       FROM custodian_applications a
       JOIN users u ON a.user_id = u.id
       WHERE a.status = 'pending'
       ORDER BY a.created_at ASC`
    );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching custodian applications:', err);
    return Response.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}
