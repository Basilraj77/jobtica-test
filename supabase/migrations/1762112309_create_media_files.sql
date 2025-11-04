-- Migration: create_media_files
-- Created at: 1762112309

-- Migration: Create media_files table
-- Purpose: Track uploaded media files in Supabase Storage
-- Created: 2025-01-03

CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- File information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Path in Supabase Storage
  storage_bucket VARCHAR(100) DEFAULT 'media',
  
  -- File metadata
  file_size BIGINT NOT NULL, -- Size in bytes
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(20),
  
  -- Dimensions (for images/videos)
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For video/audio files (in seconds)
  
  -- Categorization
  media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),
  category VARCHAR(100), -- e.g., 'blog-images', 'job-attachments', 'user-uploads'
  tags TEXT[], -- Array of tags for easier searching
  
  -- SEO and accessibility
  alt_text TEXT,
  title TEXT,
  description TEXT,
  
  -- Usage tracking
  used_in_posts UUID[], -- Array of post/content IDs where this media is used
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- User and permissions
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'::jsonb, -- EXIF data, processing info, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media_files(filename);
CREATE INDEX IF NOT EXISTS idx_media_files_media_type ON media_files(media_type);
CREATE INDEX IF NOT EXISTS idx_media_files_category ON media_files(category);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_tags ON media_files USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON media_files(mime_type);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_media_files_search ON media_files USING gin(
  to_tsvector('english', 
    coalesce(filename, '') || ' ' || 
    coalesce(alt_text, '') || ' ' || 
    coalesce(title, '') || ' ' || 
    coalesce(description, '')
  )
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS media_files_updated_at ON media_files;
CREATE TRIGGER media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_media_download_count(media_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE media_files 
  SET download_count = download_count + 1 
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_media_view_count(media_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE media_files 
  SET view_count = view_count + 1 
  WHERE id = media_id;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS (Row Level Security)
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public media is viewable by everyone" ON media_files;
CREATE POLICY "Public media is viewable by everyone"
  ON media_files
  FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Admin users can manage all media" ON media_files;
CREATE POLICY "Admin users can manage all media"
  ON media_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can manage their own media" ON media_files;
CREATE POLICY "Users can manage their own media"
  ON media_files
  FOR ALL
  USING (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Service role can insert media files" ON media_files;
CREATE POLICY "Service role can insert media files"
  ON media_files
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON TABLE media_files IS 'Tracks all media files uploaded to Supabase Storage';
COMMENT ON COLUMN media_files.file_path IS 'Full path to file in Supabase Storage bucket';
COMMENT ON COLUMN media_files.media_type IS 'Type of media: image, video, audio, document, other';
COMMENT ON COLUMN media_files.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN media_files.used_in_posts IS 'Array of post/content UUIDs where this media is referenced';;