-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  age INT,
  occupation VARCHAR(150),
  role ENUM('mentor', 'mentee', 'both', 'none') DEFAULT 'none',
  gender ENUM('male', 'female'),
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connections Table
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
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

-- Create indexes for better query performance
CREATE INDEX idx_users_dialect_group ON users(dialect_group);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_messages_connection ON messages(connection_id, id);
CREATE INDEX idx_messages_unread ON messages(connection_id, read_at) WHERE read_at IS NULL;
