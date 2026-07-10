import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/adminAuth';

// PATCH {verified?, deactivated?} — admin toggles on a user. account_type is
// deliberately never accepted here; admin status is granted by one-time SQL
// only (see plan), never through the app.
export async function PATCH(req, { params }) {
  const { error, status, decoded } = await requireAdmin(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { id } = await params;
    const body = await req.json();

    const sets = [];
    const values = [];
    let i = 1;

    if (typeof body.verified === 'boolean') {
      sets.push(`verified = $${i++}`);
      values.push(body.verified);
    }
    if (typeof body.deactivated === 'boolean') {
      if (body.deactivated && Number(id) === decoded.userId) {
        return Response.json({ error: 'You cannot deactivate your own account' }, { status: 400 });
      }
      sets.push(`deactivated = $${i++}`);
      values.push(body.deactivated);
    }

    if (sets.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE id = $${i}
       RETURNING id, first_name, last_name, email, role, verified, custodian_dialects, account_type, deactivated, created_at`,
      values
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error('Error updating user:', err);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
