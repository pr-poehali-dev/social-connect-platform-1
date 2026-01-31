CREATE TABLE IF NOT EXISTS t_p19021063_social_connect_platf.verification_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p19021063_social_connect_platf.users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    document_photo_url TEXT,
    selfie_photo_url TEXT,
    comment TEXT,
    admin_comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER REFERENCES t_p19021063_social_connect_platf.admins(id),
    reviewed_at TIMESTAMP,
    UNIQUE(user_id)
);