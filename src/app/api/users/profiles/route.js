import { query } from '@/lib/db';

export async function POST(req) {
  try {
    const { firstName, lastName, age, occupation, email, languageInterest, role } = await req.json();

    if (!firstName || !email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user with this email already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Insert user profile (no password required for this simple profile)
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, age, occupation, dialect_group, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, age, occupation, dialect_group, role, created_at`,
      [email, firstName, lastName, age || null, occupation || null, languageInterest, role, 'placeholder']
    );

    const user = result.rows[0];
    return Response.json({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      age: user.age,
      occupation: user.occupation,
      email: user.email,
      languageInterest: user.dialect_group,
      role: user.role,
      avatar: role === 'mentor' ? '👨‍🏫' : '🧑‍🎓'
    }, { status: 201 });
  } catch (error) {
    console.error('Profile creation error:', error);
    return Response.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}

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
