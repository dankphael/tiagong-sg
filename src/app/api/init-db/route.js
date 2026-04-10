import { sql } from '@vercel/postgres';

export async function GET(req) {
  // Security check - only allow from your IP or internal
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INIT_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔧 Initializing database...');

    // Create users table
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

    // Create connections table
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

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_dialect_group ON users(dialect_group);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);`;

    return Response.json({ success: true, message: '✅ Database initialized!' }, { status: 200 });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
