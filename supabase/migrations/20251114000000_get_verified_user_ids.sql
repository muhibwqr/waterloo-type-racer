-- Function to get verified user IDs (users with confirmed emails)
CREATE OR REPLACE FUNCTION public.get_verified_user_ids()
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT au.id
  FROM auth.users au
  WHERE au.email_confirmed_at IS NOT NULL;
END;
$$;

