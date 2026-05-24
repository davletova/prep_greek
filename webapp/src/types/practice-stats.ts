export interface PracticeStatsDay {
  success: number;
  fail: number;
}

export interface PracticeStatsV1 {
  version: 1;
  days: Record<string, PracticeStatsDay>;
}

export type PracticeStats = PracticeStatsV1;

export interface PracticeStatsSummary {
  success: number;
  fail: number;
  total: number;
  accuracy: number | null;
}

export interface PracticeStatsPeriodSummary extends PracticeStatsSummary {
  key: string;
  label: string;
  days: number;
}
