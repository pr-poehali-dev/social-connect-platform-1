-- Create call_history table for storing VK call logs
CREATE TABLE t_p19021063_social_connect_platf.call_history (
    id SERIAL PRIMARY KEY,
    caller_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    recipient_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('audio', 'video')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('initiated', 'connected', 'ended', 'missed', 'declined', 'failed')),
    duration_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_call_history_caller ON t_p19021063_social_connect_platf.call_history(caller_id);
CREATE INDEX idx_call_history_recipient ON t_p19021063_social_connect_platf.call_history(recipient_id);
CREATE INDEX idx_call_history_started_at ON t_p19021063_social_connect_platf.call_history(started_at DESC);

-- Add comment
COMMENT ON TABLE t_p19021063_social_connect_platf.call_history IS 'История VK звонков между пользователями';