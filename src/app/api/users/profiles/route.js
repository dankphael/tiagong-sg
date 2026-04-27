import { query } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const dialectGroup = searchParams.get('dialect');

    let sql = 'SELECT id, email, first_name, last_name, age, occupation, dialect_group, role, created_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role && role !== 'All') {
      sql += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (dialectGroup && dialectGroup !== 'All') {
      sql += ` AND dialect_group = $${paramCount}`;
      params.push(dialectGroup);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC LIMIT 100';

    const result = await query(sql, params);

    const users = result.rows.map(u => ({
      id: u.id,
      firstName: u.first_name,
      lastName: u.last_name,
      age: u.age,
      occupation: u.occupation,
      email: u.email,
      languageInterest: u.dialect_group,
      role: u.role,
      avatar: u.role === 'mentor' ? '👨‍🏫' : '🧑‍🎓'
    }));

    return Response.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return Response.json({ error: 'Failed to fetch profiles', detail: error.message }, { status: 500 });
  }
}
