-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  age INT,
  occupation VARCHAR(150),
  role VARCHAR(50) DEFAULT 'none',
  gender VARCHAR(50),
  dialect_group VARCHAR(100),
  dialects_known JSONB DEFAULT '[]',
  progress JSONB DEFAULT '{}',
  xp INT DEFAULT 0,
  streak INT DEFAULT 0,
  last_daily_date VARCHAR(20),
  -- Matchmaking fields (Sin Seh matching + chat)
  intent VARCHAR(30),
  offerings JSONB DEFAULT '[]',
  availability JSONB DEFAULT '[]',
  formats JSONB DEFAULT '[]',
  region VARCHAR(30),
  interests JSONB DEFAULT '[]',
  proficiency VARCHAR(30),
  bio TEXT,
  huay_kuan VARCHAR(50),
  verified BOOLEAN DEFAULT false,
  -- Language Custodian program
  custodian_dialects JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connections Table
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

-- Messages Table (conversation = connection)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  connection_id INT NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'text',
  body TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Contributions Table (Language Custodian program — corrections, new words,
-- usage examples, error flags; polymorphic via type + payload)
CREATE TABLE contributions (
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
);

-- Word Variants Table (accepted overlay — variants coexist, never replace
-- the original; denormalized so the public read is a trivial scan)
CREATE TABLE word_variants (
  id SERIAL PRIMARY KEY,
  contribution_id INT UNIQUE REFERENCES contributions(id) ON DELETE SET NULL,
  word_id VARCHAR(64),
  dialect VARCHAR(50) NOT NULL,
  variant_type VARCHAR(30) NOT NULL,
  payload JSONB DEFAULT '{}',
  contributor_name VARCHAR(200),
  context_note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custodian Applications Table (owner approves by setting users.custodian_dialects)
CREATE TABLE custodian_applications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  dialects JSONB DEFAULT '[]',
  background TEXT,
  credentials TEXT,
  huay_kuan VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_dialect_group ON users(dialect_group);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_messages_connection ON messages(connection_id, id);
CREATE INDEX idx_messages_unread ON messages(connection_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_contributions_status_dialect ON contributions(status, dialect);
CREATE INDEX idx_contributions_user ON contributions(user_id);
CREATE INDEX idx_contributions_word ON contributions(word_id);
CREATE INDEX idx_word_variants_word ON word_variants(word_id);
