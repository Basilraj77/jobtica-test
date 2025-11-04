CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    department TEXT,
    category TEXT,
    description TEXT,
    qualification TEXT,
    vacancies TEXT,
    posted_date TIMESTAMPTZ,
    last_date TIMESTAMPTZ,
    apply_link TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    affiliate_courses JSONB DEFAULT '[]'::jsonb,
    affiliate_books JSONB DEFAULT '[]'::jsonb
);