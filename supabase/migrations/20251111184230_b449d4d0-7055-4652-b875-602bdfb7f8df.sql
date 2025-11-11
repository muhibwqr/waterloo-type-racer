-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  tier TEXT DEFAULT 'F',
  global_rank INTEGER,
  total_tests INTEGER DEFAULT 0,
  best_wpm INTEGER DEFAULT 0,
  best_accuracy NUMERIC(5,2) DEFAULT 0,
  average_wpm INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create typing_tests table
CREATE TABLE public.typing_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wpm INTEGER NOT NULL,
  raw_wpm INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  consistency NUMERIC(5,2),
  test_mode TEXT NOT NULL, -- 'time', 'words', 'quote', 'zen', 'custom'
  test_duration INTEGER, -- seconds for time mode, null for others
  word_count INTEGER, -- for word mode
  correct_chars INTEGER NOT NULL,
  incorrect_chars INTEGER NOT NULL,
  extra_chars INTEGER DEFAULT 0,
  missed_chars INTEGER DEFAULT 0,
  language TEXT DEFAULT 'english',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on typing_tests
ALTER TABLE public.typing_tests ENABLE ROW LEVEL SECURITY;

-- Anyone can read typing tests
CREATE POLICY "Anyone can read typing tests"
ON public.typing_tests
FOR SELECT
USING (true);

-- Authenticated users can insert their own tests
CREATE POLICY "Users can insert their own tests"
ON public.typing_tests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_tier ON public.profiles(tier);
CREATE INDEX idx_typing_tests_user_id ON public.typing_tests(user_id);
CREATE INDEX idx_typing_tests_created_at ON public.typing_tests(created_at DESC);
CREATE INDEX idx_typing_tests_wpm ON public.typing_tests(wpm DESC);

-- Function to update profile stats after test
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    total_tests = total_tests + 1,
    best_wpm = GREATEST(best_wpm, NEW.wpm),
    best_accuracy = GREATEST(best_accuracy, NEW.accuracy),
    average_wpm = (
      SELECT AVG(wpm)::INTEGER 
      FROM public.typing_tests 
      WHERE user_id = NEW.user_id
    ),
    time_spent_seconds = time_spent_seconds + COALESCE(NEW.test_duration, 60),
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update profile stats
CREATE TRIGGER on_typing_test_created
  AFTER INSERT ON public.typing_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();