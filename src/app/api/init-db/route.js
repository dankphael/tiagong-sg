import { query } from '@/lib/db';

export async function GET(req) {
  // Note: Authorization check removed for initial database setup
  // const authHeader = req.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.INIT_SECRET}`) {
  //   return Response.json({ error: 'Unauthorized' }, { status: 401 });
  // }

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
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS xp INT DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_date VARCHAR(20)`);

    // Matchmaking fields (Sin Seh matching + chat)
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS intent VARCHAR(30)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS offerings JSONB DEFAULT '[]'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS formats JSONB DEFAULT '[]'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS region VARCHAR(30)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS proficiency VARCHAR(30)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS huay_kuan VARCHAR(50)`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false`);

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

    // Add message column to connections if it doesn't exist
    await query(`ALTER TABLE connections ADD COLUMN IF NOT EXISTS message TEXT`);

    // Chat messages for accepted connections (conversation = connection)
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        connection_id INT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
        sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'text',
        body TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      )
    `);

    // Language Custodian program: community contributions to the dictionary
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS custodian_dialects JSONB DEFAULT '[]'`);

    // Account types (admin console) — custodian stays derived from custodian_dialects
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'user'`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated BOOLEAN DEFAULT false`);

    await query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(30) NOT NULL,
        word_id VARCHAR(64),
        dialect VARCHAR(50) NOT NULL,
        payload JSONB DEFAULT '{}',
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        reviewer_id INT REFERENCES users(id),
        review_note TEXT,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS word_variants (
        id SERIAL PRIMARY KEY,
        contribution_id INT UNIQUE REFERENCES contributions(id) ON DELETE SET NULL,
        word_id VARCHAR(64),
        dialect VARCHAR(50) NOT NULL,
        variant_type VARCHAR(30) NOT NULL,
        payload JSONB DEFAULT '{}',
        contributor_name VARCHAR(200),
        context_note TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS custodian_applications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        dialects JSONB DEFAULT '[]',
        background TEXT,
        credentials TEXT,
        huay_kuan VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Community pronunciation recordings — base64 audio, kept out of the
    // contributions/word_variants JSONB payloads (those ride bulk public
    // endpoints and must stay small); payload only ever references the clip id.
    await query(`
      CREATE TABLE IF NOT EXISTS audio_clips (
        id SERIAL PRIMARY KEY,
        contribution_id INT REFERENCES contributions(id) ON DELETE CASCADE,
        mime_type VARCHAR(50) NOT NULL,
        data TEXT NOT NULL,
        duration_ms INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`CREATE INDEX IF NOT EXISTS idx_users_dialect_group ON users(dialect_group)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_connection ON messages(connection_id, id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(connection_id, read_at) WHERE read_at IS NULL`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contributions_status_dialect ON contributions(status, dialect)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contributions_user ON contributions(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_audio_clips_contribution ON audio_clips(contribution_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_contributions_word ON contributions(word_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_word_variants_word ON word_variants(word_id)`);

    return Response.json({ success: true, message: '✅ Database initialized!' }, { status: 200 });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
