export type UserLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface TheoryUnitProgress {
  completed: boolean;
  currentIndex?: number;
  completedAt?: string;
  lastViewedAt?: string;
}

export interface PracticeUnitProgress {
  attempts: number;
  correctAnswers: number;
  streak?: number;
  lastPracticedAt?: string;
}

export type TheoryProgressMap = Record<string, TheoryUnitProgress>;

export type PracticeProgressMap = Record<string, PracticeUnitProgress>;

export interface AppProgress {
  version: number;
  userLevel?: UserLevel;
  theory?: TheoryProgressMap;
  practice?: PracticeProgressMap;
  lastOpenedScreen?: string;
  updatedAt?: string;
}
