import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    // Optional: verify auth
    const auth = requireAuth(req);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const dialectGroup = searchParams.get('dialect');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let sql = 'SELECT id, email, first_name, last_name, age, occupation, role, dialect_group FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (dialectGroup && dialectGroup !== 'All') {
      sql += ` AND dialect_group = $${paramCount}`;
      params.push(dialectGroup);
      paramCount++;
    }

    if (role && role !== 'All') {
      sql += ` AND (role = $${paramCount} OR role = 'both')`;
      params.push(role);
      paramCount++;
    }

    if (search) {
      sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR dialect_group ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await query(sql, params);
    return Response.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
