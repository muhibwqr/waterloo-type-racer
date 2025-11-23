-- Add university column to typing_tests table
ALTER TABLE public.typing_tests 
ADD COLUMN IF NOT EXISTS university TEXT;

-- Create index for filtering by university
CREATE INDEX IF NOT EXISTS idx_typing_tests_university ON public.typing_tests(university);

