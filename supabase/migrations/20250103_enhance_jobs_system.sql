-- Migration: Enhance jobs table with analytics and management fields
-- Purpose: Add tracking, validation, and management capabilities for job listings
-- Created: 2025-01-03

-- Add new columns to jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS validation_errors JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS application_count INTEGER DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS priority_level INTEGER DEFAULT 0;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_min DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_max DECIMAL(10,2);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX IF NOT EXISTS idx_jobs_last_date ON jobs(last_date);
CREATE INDEX IF NOT EXISTS idx_jobs_is_featured ON jobs(is_featured);
CREATE INDEX IF NOT EXISTS idx_jobs_archived_at ON jobs(archived_at);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Full-text search index for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_search ON jobs USING gin(
  to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(department, '') || ' ' || 
    coalesce(description, '') || ' ' ||
    coalesce(qualification, '')
  )
);

-- Create job_templates table
CREATE TABLE IF NOT EXISTS job_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for template_id (after creating job_templates table)
ALTER TABLE jobs 
  DROP CONSTRAINT IF EXISTS fk_jobs_template,
  ADD CONSTRAINT fk_jobs_template 
  FOREIGN KEY (template_id) 
  REFERENCES job_templates(id) 
  ON DELETE SET NULL;

-- Create indexes for job_templates
CREATE INDEX IF NOT EXISTS idx_job_templates_category ON job_templates(category);
CREATE INDEX IF NOT EXISTS idx_job_templates_is_default ON job_templates(is_default);
CREATE INDEX IF NOT EXISTS idx_job_templates_is_active ON job_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_job_templates_created_by ON job_templates(created_by);

-- Create job_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS job_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'application', 'click', 'share')),
  event_data JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for job_analytics
CREATE INDEX IF NOT EXISTS idx_job_analytics_job_id ON job_analytics(job_id);
CREATE INDEX IF NOT EXISTS idx_job_analytics_event_type ON job_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_job_analytics_created_at ON job_analytics(created_at);

-- Function to update job view count
CREATE OR REPLACE FUNCTION increment_job_view_count(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE jobs 
  SET view_count = view_count + 1 
  WHERE id = p_job_id;
  
  INSERT INTO job_analytics (job_id, event_type)
  VALUES (p_job_id, 'view');
END;
$$ LANGUAGE plpgsql;

-- Function to update job application count
CREATE OR REPLACE FUNCTION increment_job_application_count(p_job_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE jobs 
  SET application_count = application_count + 1 
  WHERE id = p_job_id;
  
  INSERT INTO job_analytics (job_id, event_type)
  VALUES (p_job_id, 'application');
  
  -- Update success rate (applications / views * 100)
  UPDATE jobs
  SET success_rate = CASE 
    WHEN view_count > 0 THEN (application_count::DECIMAL / view_count::DECIMAL * 100)
    ELSE 0
  END
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE job_templates 
  SET usage_count = usage_count + 1 
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to archive expired jobs automatically
CREATE OR REPLACE FUNCTION auto_archive_expired_jobs()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE jobs
  SET 
    status = 'archived',
    archived_at = NOW()
  WHERE 
    status = 'active'
    AND last_date < NOW()
    AND archived_at IS NULL;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs (public read, admin write)
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
CREATE POLICY "Jobs are viewable by everyone"
  ON jobs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin users can manage jobs" ON jobs;
CREATE POLICY "Admin users can manage jobs"
  ON jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for job_templates
DROP POLICY IF EXISTS "Templates are viewable by admins" ON job_templates;
CREATE POLICY "Templates are viewable by admins"
  ON job_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admin users can manage templates" ON job_templates;
CREATE POLICY "Admin users can manage templates"
  ON job_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for job_analytics (admin only)
DROP POLICY IF EXISTS "Admin users can view analytics" ON job_analytics;
CREATE POLICY "Admin users can view analytics"
  ON job_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert analytics" ON job_analytics;
CREATE POLICY "Service role can insert analytics"
  ON job_analytics
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE jobs IS 'Enhanced job listings with analytics and tracking';
COMMENT ON COLUMN jobs.template_id IS 'Reference to job template used to create this job';
COMMENT ON COLUMN jobs.validation_status IS 'Validation status: pending, valid, invalid';
COMMENT ON COLUMN jobs.validation_errors IS 'Array of validation error messages';
COMMENT ON COLUMN jobs.application_count IS 'Total number of applications received';
COMMENT ON COLUMN jobs.view_count IS 'Total number of views';
COMMENT ON COLUMN jobs.success_rate IS 'Application rate (applications/views * 100)';
COMMENT ON COLUMN jobs.is_featured IS 'Whether this job is featured on the homepage';
COMMENT ON COLUMN jobs.priority_level IS 'Display priority (higher = more prominent)';

COMMENT ON TABLE job_templates IS 'Reusable job templates for faster job creation';
COMMENT ON COLUMN job_templates.template_data IS 'Complete job data structure as JSONB';
COMMENT ON COLUMN job_templates.usage_count IS 'Number of times this template has been used';

COMMENT ON TABLE job_analytics IS 'Detailed analytics tracking for job interactions';
COMMENT ON COLUMN job_analytics.event_type IS 'Type of event: view, application, click, share';
