export const LEVEL_UP_XP = 1000;

export const calculateLevel = (xp: number): number => {
  return Math.floor(xp / LEVEL_UP_XP);
};

export const getXpForNextLevel = (xp: number): number => {
  const currentLevel = calculateLevel(xp);
  return (currentLevel + 1) * LEVEL_UP_XP;
};
