-- Seed the initial "Hug My Younger Self" template
-- This runs on both local (db reset) and production (db push)

INSERT INTO public.templates (name, slug, description, prompt, credit_cost, is_active) VALUES (
  'Hug My Younger Self',
  'hug-younger-self',
  'Create a heartwarming image of you hugging your younger self. Upload a recent photo and a childhood photo to generate your time traveling hug.',
  'Create a photorealistic image showing the same person at two different ages embracing in a warm, emotional hug. The older version (from the first image) should be gently comforting and hugging the younger version (from the second image). The setting should be warm and nostalgic with soft lighting. The embrace should feel genuine and emotional, as if the older self is reassuring their younger self that everything will be okay.',
  1,
  true
) ON CONFLICT (slug) DO NOTHING;

