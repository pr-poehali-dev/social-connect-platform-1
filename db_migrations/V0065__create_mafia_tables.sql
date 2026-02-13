
CREATE TABLE mafia_rooms (
    id SERIAL PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,
    host_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 8,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    phase VARCHAR(20) DEFAULT NULL,
    phase_end_at TIMESTAMP DEFAULT NULL,
    day_number INTEGER DEFAULT 0,
    winner VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mafia_players (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES mafia_rooms(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT NULL,
    is_alive BOOLEAN DEFAULT TRUE,
    is_ready BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, user_id)
);

CREATE TABLE mafia_actions (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES mafia_rooms(id),
    day_number INTEGER NOT NULL,
    phase VARCHAR(20) NOT NULL,
    actor_id INTEGER NOT NULL REFERENCES users(id),
    target_id INTEGER REFERENCES users(id),
    action_type VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mafia_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES mafia_rooms(id),
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    phase VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mafia_rooms_status ON mafia_rooms(status);
CREATE INDEX idx_mafia_rooms_code ON mafia_rooms(code);
CREATE INDEX idx_mafia_players_room ON mafia_players(room_id);
CREATE INDEX idx_mafia_players_user ON mafia_players(user_id);
CREATE INDEX idx_mafia_actions_room ON mafia_actions(room_id);
CREATE INDEX idx_mafia_messages_room ON mafia_messages(room_id);
