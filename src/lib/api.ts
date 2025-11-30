import { supabase } from "@/integrations/supabase/client";
import { University } from "@/utils/universities";

export interface TypingTestResult {
  user_id: string;
  wpm: number;
  raw_wpm: number;
  accuracy: number;
  university: University;
}

export const saveTypingTestScore = async (data: TypingTestResult) => {
  const { data: insertedData, error } = await supabase
    .from("typing_tests_seed")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return insertedData;
};

