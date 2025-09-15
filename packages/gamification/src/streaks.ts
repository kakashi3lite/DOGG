import { Progress } from "types";

export const calculateStreak = (progress: Progress[]): number => {
  if (progress.length === 0) {
    return 0;
  }

  // Sort progress by date descending
  const sortedProgress = progress.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  let streak = 0;
  let lastDate = new Date();

  for (const p of sortedProgress) {
    const progressDate = new Date(p.createdAt);
    const diff = Math.floor(
      (lastDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diff === 0) {
      // Same day, continue
      continue;
    }

    if (diff === 1) {
      streak++;
    } else {
      // Gap in progress, break streak
      break;
    }
    lastDate = progressDate;
  }

  // If there is at least one progress, the streak is at least 1
  if (streak === 0 && progress.length > 0) {
    streak = 1;
  }

  return streak;
};
