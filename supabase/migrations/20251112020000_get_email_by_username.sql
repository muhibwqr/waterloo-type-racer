-- Function to get email by username
-- This function allows looking up a user's email from their username
CREATE OR REPLACE FUNCTION get_email_by_username(username_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT au.email INTO user_email
  FROM auth.users au
  INNER JOIN public.profiles p ON au.id = p.id
  WHERE p.username = username_input
  LIMIT 1;
  
  RETURN user_email;
END;
$$;

