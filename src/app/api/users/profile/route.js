import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { firstName, lastName, age, occupation, languageInterest, role, dialectsKnown } = await req.json();

    await query(
      `UPDATE users SET first_name=$1, last_name=$2, age=$3, occupation=$4,
       dialect_group=$5, role=$6, dialects_known=$7,
       updated_at=CURRENT_TIMESTAMP WHERE id=$8`,
      [
        firstName || null,
        lastName || null,
        age || null,
        occupation || null,
        languageInterest || null,
        role || 'mentee',
        JSON.stringify(dialectsKnown || []),
        decoded.userId,
      ]
    );

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error('Error updating profile:', err);
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
