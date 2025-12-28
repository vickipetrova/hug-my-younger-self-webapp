-- Seed data for Time Hug app
-- This runs after all migrations when you do `supabase db reset`

-- Insert the initial "Hug My Younger Self" template
INSERT INTO public.templates (name, slug, description, prompt, credit_cost, is_active) VALUES (
  'Hug My Younger Self',
  'hug-younger-self',
  'Create a heartwarming image of you hugging your younger self. Upload a recent photo and a childhood photo to generate your time-traveling hug.',
  'Take a photo taken with a Polaroid camera. The photo should look like an ordinary photograph without an explicit subject or property. The photo should have a slight blur and a consistent light source, like a flash from a dark room, scattered throughout the photo. Don’t change the face. Change the background to white curtains. With me hugging my younger self. Output image should be with aspect ratio: 4:5 / 1080x1350 pixels.',
  1,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  prompt = EXCLUDED.prompt,
  credit_cost = EXCLUDED.credit_cost,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

