CREATE TABLE preparation_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    price TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);