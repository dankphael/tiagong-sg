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
  dialect_group VARCHAR(100),
  dialects_known JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connections Table
CREATE TABLE connections (
  id SERIAL PRIMARY KEY,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(requester_id, receiver_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_dialect_group ON users(dialect_group);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_connections_requester ON connections(requester_id);
CREATE INDEX idx_connections_receiver ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);
