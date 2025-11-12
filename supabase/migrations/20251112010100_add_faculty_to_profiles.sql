-- Add faculty column if it's missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS faculty TEXT;

-- Ensure insert trigger captures faculty metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, faculty)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NULLIF(NEW.raw_user_meta_data->>'faculty', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    username = EXCLUDED.username,
    faculty = EXCLUDED.faculty;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

