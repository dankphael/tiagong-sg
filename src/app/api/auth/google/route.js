import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { googleToken, email, name, picture } = await req.json();

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    // Extract first and last name from Google's name field
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Check if user exists
    let user = await query('SELECT id, email, first_name, last_name FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      // Create new user from Google profile
      const result = await query(
        `INSERT INTO users (email, first_name, last_name, password_hash)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, first_name, last_name, dialect_group, role`,
        [email, firstName, lastName, 'google-oauth']
      );
      user = result;
    }

    const userData = user.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: userData.id, email: userData.email },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '30d' }
    );

    return Response.json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        role: userData.role || 'mentee',
        languageInterest: userData.dialect_group || 'Hokkien',
        avatar: picture || (userData.role === 'mentor' ? '👨‍🏫' : '🧑‍🎓')
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
