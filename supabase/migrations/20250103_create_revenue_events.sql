-- Migration: Create revenue_events table
-- Purpose: Track revenue events from various sources (affiliates, ads, subscriptions)
-- Created: 2025-01-03

CREATE TABLE IF NOT EXISTS revenue_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('affiliate_click', 'affiliate_conversion', 'ad_impression', 'ad_click', 'subscription_payment', 'one_time_payment')),
  source VARCHAR(100) NOT NULL, -- e.g., 'amazon', 'google_ads', 'stripe'
  revenue_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Related entity IDs
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional data like commission rate, product details, etc.
  
  -- Tracking fields
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  
  -- Timestamps
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_revenue_events_event_type ON revenue_events(event_type);
CREATE INDEX idx_revenue_events_source ON revenue_events(source);
CREATE INDEX idx_revenue_events_event_timestamp ON revenue_events(event_timestamp);
CREATE INDEX idx_revenue_events_job_id ON revenue_events(job_id);
CREATE INDEX idx_revenue_events_user_id ON revenue_events(user_id);
CREATE INDEX idx_revenue_events_created_at ON revenue_events(created_at);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_revenue_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER revenue_events_updated_at
  BEFORE UPDATE ON revenue_events
  FOR EACH ROW
  EXECUTE FUNCTION update_revenue_events_updated_at();

-- Enable RLS (Row Level Security)
ALTER TABLE revenue_events ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin users can do everything
CREATE POLICY "Admin users can manage revenue events"
  ON revenue_events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Allow service role to insert revenue events (for backend tracking)
CREATE POLICY "Service role can insert revenue events"
  ON revenue_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE revenue_events IS 'Tracks all revenue-generating events across the platform';
COMMENT ON COLUMN revenue_events.event_type IS 'Type of revenue event: affiliate_click, affiliate_conversion, ad_impression, ad_click, subscription_payment, one_time_payment';
COMMENT ON COLUMN revenue_events.source IS 'Source of the revenue (e.g., amazon, google_ads, stripe)';
COMMENT ON COLUMN revenue_events.revenue_amount IS 'Amount of revenue in the specified currency';
COMMENT ON COLUMN revenue_events.metadata IS 'Additional JSON metadata about the event';
