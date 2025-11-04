CREATE TABLE breaking_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);