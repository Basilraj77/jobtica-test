-- Migration: Create content_versions table
-- Purpose: Track version history of content posts for rollback and audit
-- Created: 2025-01-03

CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content reference
  content_id UUID NOT NULL, -- References posts.id or other content tables
  content_type VARCHAR(50) NOT NULL DEFAULT 'post', -- 'post', 'job', 'page', etc.
  version_number INTEGER NOT NULL,
  
  -- Snapshot of content at this version
  title TEXT,
  slug VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  
  -- Metadata snapshot
  metadata JSONB DEFAULT '{}'::jsonb, -- Complete snapshot of all content metadata
  
  -- SEO snapshot
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  
  -- Status at this version
  status VARCHAR(50),
  
  -- Media snapshot
  featured_image TEXT,
  media_files UUID[], -- Array of media file IDs used in this version
  
  -- Categorization snapshot
  category VARCHAR(100),
  tags TEXT[],
  
  -- Version metadata
  change_summary TEXT, -- Description of what changed
  is_auto_save BOOLEAN DEFAULT false,
  is_published_version BOOLEAN DEFAULT false,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by_name VARCHAR(255), -- Denormalized for historical record
  created_by_email VARCHAR(255), -- Denormalized for historical record
  
  -- Restore tracking
  restored_from_version INTEGER, -- If this version was restored from another version
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_content_type ON content_versions(content_type);
CREATE INDEX idx_content_versions_version_number ON content_versions(version_number);
CREATE INDEX idx_content_versions_created_by ON content_versions(created_by);
CREATE INDEX idx_content_versions_created_at ON content_versions(created_at);
CREATE INDEX idx_content_versions_is_published ON content_versions(is_published_version);

-- Composite index for efficient version lookup
CREATE UNIQUE INDEX idx_content_versions_unique_version 
  ON content_versions(content_id, version_number);

-- Create a function to automatically create a version when content is updated
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
  user_name VARCHAR(255);
  user_email VARCHAR(255);
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO next_version
  FROM content_versions
  WHERE content_id = NEW.id;
  
  -- Get user info if available
  IF NEW.updated_by IS NOT NULL THEN
    SELECT 
      COALESCE(raw_user_meta_data->>'name', email),
      email
    INTO user_name, user_email
    FROM auth.users
    WHERE id = NEW.updated_by;
  END IF;
  
  -- Insert new version
  INSERT INTO content_versions (
    content_id,
    content_type,
    version_number,
    title,
    slug,
    content,
    excerpt,
    metadata,
    seo_title,
    seo_description,
    status,
    featured_image,
    category,
    tags,
    created_by,
    created_by_name,
    created_by_email,
    is_published_version
  ) VALUES (
    NEW.id,
    TG_TABLE_NAME,
    next_version,
    NEW.title,
    NEW.slug,
    NEW.content,
    NEW.excerpt,
    row_to_json(NEW)::jsonb,
    NEW.seo_title,
    NEW.seo_description,
    NEW.status,
    NEW.featured_image,
    NEW.category,
    NEW.tags,
    NEW.updated_by,
    user_name,
    user_email,
    (NEW.status = 'published')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore a specific version
CREATE OR REPLACE FUNCTION restore_content_version(
  p_content_id UUID,
  p_version_number INTEGER
)
RETURNS TABLE (
  title TEXT,
  slug VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status VARCHAR(50),
  featured_image TEXT,
  category VARCHAR(100),
  tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.title,
    v.slug,
    v.content,
    v.excerpt,
    v.seo_title,
    v.seo_description,
    v.status,
    v.featured_image,
    v.category,
    v.tags
  FROM content_versions v
  WHERE v.content_id = p_content_id
    AND v.version_number = p_version_number;
END;
$$ LANGUAGE plpgsql;

-- Function to get version diff (simplified - returns both versions for comparison)
CREATE OR REPLACE FUNCTION get_version_diff(
  p_content_id UUID,
  p_version1 INTEGER,
  p_version2 INTEGER
)
RETURNS TABLE (
  version1_data JSONB,
  version2_data JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT row_to_json(v1)::jsonb FROM content_versions v1 
     WHERE v1.content_id = p_content_id AND v1.version_number = p_version1),
    (SELECT row_to_json(v2)::jsonb FROM content_versions v2 
     WHERE v2.content_id = p_content_id AND v2.version_number = p_version2);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Admin users can view and manage all versions
CREATE POLICY "Admin users can manage all content versions"
  ON content_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can view versions of their own content
CREATE POLICY "Users can view their own content versions"
  ON content_versions
  FOR SELECT
  USING (created_by = auth.uid());

-- Service role can insert versions
CREATE POLICY "Service role can insert content versions"
  ON content_versions
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE content_versions IS 'Stores complete version history of content for rollback and audit';
COMMENT ON COLUMN content_versions.content_id IS 'Reference to the content being versioned (e.g., posts.id)';
COMMENT ON COLUMN content_versions.version_number IS 'Sequential version number for this content';
COMMENT ON COLUMN content_versions.metadata IS 'Complete JSON snapshot of the content at this version';
COMMENT ON COLUMN content_versions.change_summary IS 'Optional description of what changed in this version';
COMMENT ON COLUMN content_versions.is_auto_save IS 'Whether this version was created by auto-save';
COMMENT ON COLUMN content_versions.is_published_version IS 'Whether this version represents a published state';
