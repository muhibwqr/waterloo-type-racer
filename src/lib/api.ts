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
  const { data: insertedData, error } = await supabase.rpc("submit_typing_test", {
    p_user_id: data.user_id,
    p_wpm: data.wpm,
    p_raw_wpm: data.raw_wpm,
    p_accuracy: data.accuracy,
    p_university: data.university,
  });

  if (error) {
    throw error;
  }

  return insertedData;
};

