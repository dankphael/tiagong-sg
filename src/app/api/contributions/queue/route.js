import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

// GET — pending contributions scoped to the caller's custodian dialects
export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const userResult = await query(`SELECT custodian_dialects, account_type FROM users WHERE id = $1`, [decoded.userId]);
    const custodianDialects = userResult.rows[0]?.custodian_dialects || [];
    const isAdmin = userResult.rows[0]?.account_type === 'admin';
    if (!isAdmin && (!Array.isArray(custodianDialects) || custodianDialects.length === 0)) {
      return Response.json({ error: 'Not a Language Custodian' }, { status: 403 });
    }

    // Admins act as super-custodians and see every dialect's queue
    const result = isAdmin
      ? await query(
          `SELECT c.id, c.type, c.word_id, c.dialect, c.payload, c.reason, c.status, c.created_at,
           u.first_name, u.last_name
           FROM contributions c
           JOIN users u ON c.user_id = u.id
           WHERE c.status = 'pending'
           ORDER BY c.created_at ASC`
        )
      : await query(
          `SELECT c.id, c.type, c.word_id, c.dialect, c.payload, c.reason, c.status, c.created_at,
           u.first_name, u.last_name
           FROM contributions c
           JOIN users u ON c.user_id = u.id
           WHERE c.status = 'pending' AND c.dialect = ANY($1::text[])
           ORDER BY c.created_at ASC`,
          [custodianDialects]
        );

    return Response.json(result.rows, { status: 200 });
  } catch (err) {
    console.error('Error fetching contribution queue:', err);
    return Response.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}
