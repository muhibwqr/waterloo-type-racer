-- Add ID verification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN id_image_url TEXT,
ADD COLUMN id_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN id_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN id_review_notes TEXT;

-- Create index for verification status queries
CREATE INDEX idx_profiles_verification_status ON public.profiles(id_verification_status);

-- Note: The existing "Users can update their own profile" policy will allow
-- users to update id_image_url and id_submitted_at, but status changes
-- should be restricted to admins (handled via Supabase dashboard or admin functions)

