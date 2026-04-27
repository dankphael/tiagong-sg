import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req) {
  const { error, status, decoded } = requireAuth(req);
  if (error) return Response.json({ error }, { status });

  try {
    const result = await query(
      `SELECT id, email, first_name, last_name, age, occupation, dialect_group, role, progress
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const u = result.rows[0];
    return Response.json({
      user: {
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        age: u.age,
        occupation: u.occupation,
        role: u.role || 'mentee',
        languageInterest: u.dialect_group || 'Hokkien',
        avatar: u.role === 'mentor' ? '👨‍🏫' : '🧑‍🎓',
        progress: u.progress || {},
      },
    }, { status: 200 });
  } catch (err) {
    console.error('Error fetching user:', err);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
