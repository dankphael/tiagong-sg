import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

function decodeGoogleCredential(credential) {
  const parts = credential.split('.');
  if (parts.length < 2) throw new Error('Invalid credential');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
  if (!payload.email) throw new Error('No email in credential');
  const [firstName, ...rest] = (payload.name || '').split(' ');
  return {
    email: payload.email,
    firstName: firstName || '',
    lastName: rest.join(' ') || '',
    picture: payload.picture || null,
  };
}

function signToken(userId, email) {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '30d' }
  );
}

function userResponse(row, picture) {
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    occupation: row.occupation,
    role: row.role || 'mentee',
    languageInterest: row.dialect_group || 'Hokkien',
    avatar: row.role === 'mentor' ? '👨‍🏫' : '🧑‍🎓',
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { credential, profileData } = body;

    if (!credential) {
      return Response.json({ error: 'Missing Google credential' }, { status: 400 });
    }

    const googleData = decodeGoogleCredential(credential);

    const existing = await query(
      'SELECT id, email, first_name, last_name, age, occupation, dialect_group, role FROM users WHERE email = $1',
      [googleData.email]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      const token = signToken(row.id, row.email);
      return Response.json({ token, user: userResponse(row, googleData.picture) }, { status: 200 });
    }

    if (!profileData) {
      return Response.json({ needsProfile: true, googleData }, { status: 200 });
    }

    const { age, occupation, languageInterest, role } = profileData;
    const result = await query(
      `INSERT INTO users (email, first_name, last_name, age, occupation, dialect_group, role, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, age, occupation, dialect_group, role`,
      [
        googleData.email,
        googleData.firstName,
        googleData.lastName,
        age || null,
        occupation || null,
        languageInterest || 'Hokkien',
        role || 'mentee',
        'google-oauth',
      ]
    );

    const row = result.rows[0];
    const token = signToken(row.id, row.email);
    return Response.json({ token, user: userResponse(row, googleData.picture) }, { status: 201 });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return Response.json({ error: 'Authentication failed', detail: error.message }, { status: 500 });
  }
}
