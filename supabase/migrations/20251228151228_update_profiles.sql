-- Update the existing profiles table to add new columns
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Remove the old full_name column (separate ALTER statement)
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS full_name;