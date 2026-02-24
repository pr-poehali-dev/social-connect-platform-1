
-- SOS requests table
CREATE TABLE t_p19021063_social_connect_platf.sos_requests (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    reason TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_km INTEGER NOT NULL DEFAULT 5,
    conversation_id INTEGER REFERENCES t_p19021063_social_connect_platf.conversations(id),
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by INTEGER REFERENCES t_p19021063_social_connect_platf.users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add sos type to conversations (sos_request_id for linking)
ALTER TABLE t_p19021063_social_connect_platf.conversations
    ADD COLUMN IF NOT EXISTS sos_request_id INTEGER REFERENCES t_p19021063_social_connect_platf.sos_requests(id);

-- Index for fast geo queries
CREATE INDEX IF NOT EXISTS idx_sos_requests_creator ON t_p19021063_social_connect_platf.sos_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_sos_requests_active ON t_p19021063_social_connect_platf.sos_requests(is_resolved);
