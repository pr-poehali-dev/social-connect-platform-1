-- Create contacts table for phone book
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  instagram VARCHAR(100),
  telegram VARCHAR(100),
  avatar VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_name ON contacts(name);