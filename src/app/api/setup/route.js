import { sql } from '@vercel/postgres';

export async function POST(req) {
  // Security: only allow from localhost or internal requests
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  try {
    console.log('Creating tables...');

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        age INT,
        occupation VARCHAR(150),
        role VARCHAR(50) DEFAULT 'none',
        dialect_group VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, receiver_id)
      );
    `;

    console.log('✅ Database setup complete!');
    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
