-- Create templates table for AI image generation templates
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  prompt TEXT NOT NULL,
  credit_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active templates (public read)
CREATE POLICY "Anyone can view active templates"
  ON public.templates
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert templates
CREATE POLICY "Admins can insert templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update templates
CREATE POLICY "Admins can update templates"
  ON public.templates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete templates
CREATE POLICY "Admins can delete templates"
  ON public.templates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for faster slug lookups
CREATE INDEX templates_slug_idx ON public.templates(slug);
CREATE INDEX templates_is_active_idx ON public.templates(is_active);

