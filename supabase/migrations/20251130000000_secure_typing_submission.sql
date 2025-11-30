-- Function to securely submit typing tests
CREATE OR REPLACE FUNCTION submit_typing_test(
  p_wpm INTEGER,
  p_raw_wpm INTEGER,
  p_accuracy NUMERIC,
  p_university TEXT,
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Input validation
  IF p_wpm > 300 THEN
    RAISE EXCEPTION 'WPM exceeds maximum allowed value (300)';
  END IF;

  IF p_wpm < 0 THEN
    RAISE EXCEPTION 'WPM cannot be negative';
  END IF;

  IF p_accuracy < 0 OR p_accuracy > 100 THEN
    RAISE EXCEPTION 'Accuracy must be between 0 and 100';
  END IF;

  IF length(p_university) > 100 THEN
    RAISE EXCEPTION 'University name is too long';
  END IF;

  -- Insert into typing_tests_seed
  -- We let the database handle defaults for other columns (like id, created_at)
  INSERT INTO public.typing_tests_seed (
    user_id,
    wpm,
    raw_wpm,
    accuracy,
    university
  )
  VALUES (
    p_user_id,
    p_wpm,
    p_raw_wpm,
    p_accuracy,
    p_university
  )
  RETURNING to_jsonb(typing_tests_seed.*) INTO v_result;

  RETURN v_result;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION submit_typing_test TO anon, authenticated;

-- Revoke direct insert permission on the table to prevent bypass
REVOKE INSERT ON TABLE public.typing_tests_seed FROM anon;
REVOKE INSERT ON TABLE public.typing_tests_seed FROM authenticated;
