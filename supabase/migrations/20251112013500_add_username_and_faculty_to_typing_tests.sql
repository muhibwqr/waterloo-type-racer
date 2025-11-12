ALTER TABLE public.typing_tests
ADD COLUMN IF NOT EXISTS username TEXT;

ALTER TABLE public.typing_tests
ADD COLUMN IF NOT EXISTS faculty TEXT;

