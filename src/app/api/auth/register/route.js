import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { email, password, first_name, last_name, age, occupation, dialect_group, role } = await req.json();

    // Validate input
    if (!email || !password || !first_name || !last_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, age, occupation, dialect_group, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, first_name, last_name, age, dialect_group, role`,
      [email, hashedPassword, first_name, last_name, age, occupation, dialect_group, role]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return Response.json({ token, user }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
