-- Add approval tracking columns to typing_tests table
ALTER TABLE public.typing_tests 
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_typing_tests_flagged ON public.typing_tests(flagged) WHERE flagged = true;
CREATE INDEX IF NOT EXISTS idx_typing_tests_approved ON public.typing_tests(approved) WHERE approved IS NOT NULL;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin';
END;
$$;

-- RLS Policy: Admins have full access to all typing tests
CREATE POLICY IF NOT EXISTS "admins_full_access" ON public.typing_tests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policy: Admins can update approval fields for any test
CREATE POLICY IF NOT EXISTS "admins_can_approve_tests" ON public.typing_tests
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow admins to delete tests (for deny action)
CREATE POLICY IF NOT EXISTS "admins_can_delete_tests" ON public.typing_tests
  FOR DELETE
  USING (public.is_admin());

