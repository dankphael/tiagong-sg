import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const { firstName, lastName, age, occupation, languageInterest, role, gender, dialectsKnown } = await req.json();

    if (!gender || !['male', 'female'].includes(gender)) {
      return Response.json({ error: 'Gender is required and must be male or female' }, { status: 400 });
    }

    await query(
      `UPDATE users SET first_name=$1, last_name=$2, age=$3, occupation=$4,
       dialect_group=$5, role=$6, gender=$7, dialects_known=$8,
       updated_at=CURRENT_TIMESTAMP WHERE id=$9`,
      [
        firstName || null,
        lastName || null,
        age || null,
        occupation || null,
        languageInterest || null,
        role || 'mentee',
        gender,
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
