CREATE TABLE custom_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);