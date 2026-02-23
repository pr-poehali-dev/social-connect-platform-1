
CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.miss_loveis_contestants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    total_votes INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.miss_loveis_votes (
    id SERIAL PRIMARY KEY,
    voter_id INTEGER NOT NULL,
    contestant_id INTEGER NOT NULL,
    tokens_spent INTEGER NOT NULL DEFAULT 1,
    voted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_miss_loveis_votes_voter ON t_p19021063_social_connect_platf.miss_loveis_votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_miss_loveis_votes_contestant ON t_p19021063_social_connect_platf.miss_loveis_votes(contestant_id);
CREATE INDEX IF NOT EXISTS idx_miss_loveis_contestants_votes ON t_p19021063_social_connect_platf.miss_loveis_contestants(total_votes DESC);
