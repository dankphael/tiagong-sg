import { query } from '@/lib/db';

export async function GET(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.INIT_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🔧 Initializing database...');

    await query(`
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
        progress JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns to existing tables that predate these migrations
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS progress JSONB DEFAULT '{}'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dialects_known JSONB DEFAULT '[]'`);

    await query(`
      CREATE TABLE IF NOT EXISTS connections (
        id SERIAL PRIMARY KEY,
        requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, receiver_id)
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_users_dialect_group ON users(dialect_group)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)`);

    return Response.json({ success: true, message: '✅ Database initialized!' }, { status: 200 });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
