CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.user_blocks (
    id SERIAL PRIMARY KEY,
    blocker_user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    blocked_user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_user_id, blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON t_p19021063_social_connect_platf.user_blocks(blocker_user_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON t_p19021063_social_connect_platf.user_blocks(blocked_user_id);