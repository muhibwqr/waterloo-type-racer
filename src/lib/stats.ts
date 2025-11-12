export const computeTierFromWpm = (wpm: number): string => {
  if (wpm >= 140) return "S+";
  if (wpm >= 125) return "S";
  if (wpm >= 115) return "A+";
  if (wpm >= 105) return "A";
  if (wpm >= 95) return "B";
  if (wpm >= 85) return "C";
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

