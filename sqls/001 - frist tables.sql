CREATE TYPE voz_user_role AS ENUM (
    'USER',
    'MODERATOR',
    'ADMIN'
);

select * from voz_users

CREATE TABLE voz_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cpf TEXT UNIQUE NOT NULL,

    birth_date DATE,
    phone_number TEXT,

    avatar_url TEXT,

    role TEXT DEFAULT 'USER',

    password_hash TEXT NOT NULL,
	is_banned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	banned_at TIMESTAMP
);

CREATE TABLE voz_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    category TEXT NOT NULL,

    priority INTEGER NOT NULL,
    visibility TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending',

    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,

    address TEXT,

    created_by UUID NOT NULL REFERENCES voz_users(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE voz_complaint_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    complaint_id UUID NOT NULL REFERENCES voz_complaints(id) ON DELETE CASCADE,

    type TEXT NOT NULL,
    url TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE voz_complaint_votes (
    user_id UUID NOT NULL REFERENCES voz_users(id) ON DELETE CASCADE,
    complaint_id UUID NOT NULL REFERENCES voz_complaints(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, complaint_id)
);

CREATE TABLE voz_petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,
    description TEXT NOT NULL,

    category TEXT NOT NULL,

    goal INTEGER NOT NULL,

    scope TEXT NOT NULL,
    city_ibge_code TEXT,

    visibility TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',

    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    address TEXT,
    neighborhood TEXT,

    created_by UUID NOT NULL REFERENCES voz_users(id) ON DELETE CASCADE,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMP,

    formal_document_url TEXT
);

CREATE TABLE voz_petition_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    petition_id UUID NOT NULL REFERENCES voz_petitions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES voz_users(id) ON DELETE CASCADE,

    voter_registration_number TEXT,
    full_name TEXT NOT NULL,

    cpf_hash TEXT NOT NULL,

    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    UNIQUE (petition_id, cpf_hash)
);


CREATE INDEX voz_idx_complaints_location 
ON voz_complaints (lat, lng);

CREATE INDEX voz_idx_complaints_status
ON voz_complaints (status);

CREATE INDEX voz_idx_complaints_created_at
ON voz_complaints (created_at DESC);

CREATE INDEX voz_idx_petitions_created_at
ON voz_petitions (created_at DESC);

INSERT INTO voz_users (
    name,
    email,
    cpf,
    role,
    password_hash
)
VALUES (
    'Administrador',
    'admin@vozurbana.com',
    '00000000000',
    'ADMIN',
    '$2b$10$7QJ8kG7j5Gv7sZcTzF4D4Oa1XKxkW9FQYQeW0qY3M3z9Vd1mQ8K7K'
);