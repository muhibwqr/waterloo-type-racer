/**
 * Calculate adjusted WPM that factors in accuracy
 * Lower accuracy = lower effective WPM
 */
export const calculateAdjustedWpm = (wpm: number, accuracy: number): number => {
  const normalizedAccuracy = Math.min(100, Math.max(0, accuracy)) / 100;
  return Math.round(wpm * normalizedAccuracy);
};

/**
 * Compute tier based on WPM, adjusted for accuracy
 */
export const computeTierFromWpm = (wpm: number, accuracy?: number | null): string => {
  // If accuracy is provided, use adjusted WPM
  const effectiveWpm = accuracy !== null && accuracy !== undefined 
    ? calculateAdjustedWpm(wpm, accuracy)
    : wpm;
  
  if (effectiveWpm >= 140) return "S+";
  if (effectiveWpm >= 125) return "S";
  if (effectiveWpm >= 115) return "A+";
  if (effectiveWpm >= 105) return "A";
  if (effectiveWpm >= 95) return "B";
  if (effectiveWpm >= 85) return "C";
  return "D";
};

export const formatDuration = (seconds?: number | null): string => {
  const safeSeconds = Math.max(seconds ?? 0, 0);
  if (safeSeconds === 0) return "0 min";

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.round((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  return `${minutes}m`;
};

