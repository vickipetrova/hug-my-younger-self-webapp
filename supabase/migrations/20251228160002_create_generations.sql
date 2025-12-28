-- Create generations table to track AI image generation requests
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_images TEXT[] NOT NULL,
  output_image TEXT,
  prompt_used TEXT,
  credits_charged INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processing_time_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON public.generations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own generations
CREATE POLICY "Users can create own generations"
  ON public.generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own generations (for status updates from server)
-- Note: In production, you might want to restrict this to server-side only
CREATE POLICY "Users can update own generations"
  ON public.generations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Admins can view all generations
CREATE POLICY "Admins can view all generations"
  ON public.generations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update any generation
CREATE POLICY "Admins can update any generation"
  ON public.generations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for faster queries
CREATE INDEX generations_user_id_idx ON public.generations(user_id);
CREATE INDEX generations_status_idx ON public.generations(status);
CREATE INDEX generations_created_at_idx ON public.generations(created_at DESC);

