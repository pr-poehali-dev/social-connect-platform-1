
CREATE TABLE t_p19021063_social_connect_platf.poker_rooms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,
    host_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    name VARCHAR(100) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 8,
    small_blind INTEGER NOT NULL DEFAULT 10,
    big_blind INTEGER NOT NULL DEFAULT 20,
    start_chips INTEGER NOT NULL DEFAULT 1000,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_p19021063_social_connect_platf.poker_players (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.poker_rooms(id),
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    seat INTEGER NOT NULL,
    chips INTEGER NOT NULL DEFAULT 1000,
    is_ready BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_folded BOOLEAN NOT NULL DEFAULT FALSE,
    current_bet INTEGER NOT NULL DEFAULT 0,
    hole_cards TEXT DEFAULT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id),
    UNIQUE(room_id, seat)
);

CREATE TABLE t_p19021063_social_connect_platf.poker_games (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.poker_rooms(id),
    dealer_seat INTEGER NOT NULL DEFAULT 0,
    current_turn_seat INTEGER DEFAULT NULL,
    phase VARCHAR(20) NOT NULL DEFAULT 'preflop',
    community_cards TEXT DEFAULT '',
    pot INTEGER NOT NULL DEFAULT 0,
    current_bet INTEGER NOT NULL DEFAULT 0,
    deck TEXT NOT NULL DEFAULT '',
    turn_end_at TIMESTAMP DEFAULT NULL,
    winner_id INTEGER DEFAULT NULL,
    winner_hand VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE t_p19021063_social_connect_platf.poker_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.poker_rooms(id),
    user_id INTEGER REFERENCES t_p19021063_social_connect_platf.users(id),
    message TEXT NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_poker_rooms_status ON t_p19021063_social_connect_platf.poker_rooms(status);
CREATE INDEX idx_poker_players_room ON t_p19021063_social_connect_platf.poker_players(room_id);
CREATE INDEX idx_poker_games_room ON t_p19021063_social_connect_platf.poker_games(room_id);
CREATE INDEX idx_poker_messages_room ON t_p19021063_social_connect_platf.poker_messages(room_id);
