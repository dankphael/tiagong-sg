import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// GET ?search= — browse/search users for the admin console
export async function GET(req) {
  const { error, status } = await requireAdmin(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();

    let sql = `SELECT id, first_name, last_name, email, role, verified, custodian_dialects, account_type, deactivated, created_at FROM users`;
    const params = [];
    if (search) {
      sql += ` WHERE (first_name || ' ' || last_name) ILIKE $1 OR email ILIKE $1`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await query(sql, params);
    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching users:', err);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
