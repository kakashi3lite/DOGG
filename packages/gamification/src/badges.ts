import { Progress, UserAchievement } from "types";

export interface BadgeRule {
  id: string;
  name: string;
  description: string;
  check: (progress: Progress[], achievements: UserAchievement[]) => boolean;
}

export const badgeRules: BadgeRule[] = [
  {
    id: "first-lesson",
    name: "First Lesson",
    description: "Complete your first lesson",
    check: (progress) => progress.length > 0,
  },
  {
    id: "five-lessons",
    name: "Five Lessons",
    description: "Complete 5 lessons",
    check: (progress) => progress.length >= 5,
  },
  {
    id: "ten-lessons",
    name: "Ten Lessons",
    description: "Complete 10 lessons",
    check: (progress) => progress.length >= 10,
  },
];
