import type {
  PracticeStats,
  PracticeStatsDay,
  PracticeStatsPeriodSummary,
  PracticeStatsSummary,
} from "../types/practice-stats.ts";

export const PRACTICE_STATS_VERSION = 1;
export const PRACTICE_STATS_RETENTION_DAYS = 30;

export const PRACTICE_STATS_PERIODS = [
  { key: "today", label: "Сегодня", days: 1 },
  { key: "7-days", label: "7 дней", days: 7 },
  { key: "14-days", label: "14 дней", days: 14 },
  { key: "30-days", label: "30 дней", days: 30 },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDayKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key);
}

function parseDay(value: unknown): PracticeStatsDay | null {
  if (!isRecord(value)) {
    return null;
  }

  const success = value.success;
  const fail = value.fail;

  if (
    typeof success !== "number" ||
    typeof fail !== "number" ||
    !Number.isFinite(success) ||
    !Number.isFinite(fail)
  ) {
    return null;
  }

  return {
    success: Math.max(0, Math.floor(success)),
    fail: Math.max(0, Math.floor(fail)),
  };
}

export function createEmptyPracticeStats(): PracticeStats {
  return {
    version: PRACTICE_STATS_VERSION,
    days: {},
  };
}

export function formatLocalDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function normalizePracticeStats(value: unknown): PracticeStats {
  if (!isRecord(value) || value.version !== PRACTICE_STATS_VERSION) {
    return createEmptyPracticeStats();
  }

  const daysValue = value.days;
  if (!isRecord(daysValue)) {
    return createEmptyPracticeStats();
  }

  const days: PracticeStats["days"] = {};

  for (const [dayKey, dayValue] of Object.entries(daysValue)) {
    const day = parseDay(dayValue);
    if (isValidDayKey(dayKey) && day) {
      days[dayKey] = day;
    }
  }

  return {
    version: PRACTICE_STATS_VERSION,
    days,
  };
}

export function prunePracticeStats(
  stats: PracticeStats,
  now = new Date(),
  retentionDays = PRACTICE_STATS_RETENTION_DAYS
): PracticeStats {
  const minDayKey = formatLocalDayKey(addDays(now, -(retentionDays - 1)));
  const days: PracticeStats["days"] = {};

  for (const [dayKey, day] of Object.entries(stats.days)) {
    if (dayKey >= minDayKey) {
      days[dayKey] = day;
    }
  }

  return {
    ...stats,
    days,
  };
}

export function recordPracticeAnswer(
  stats: PracticeStats,
  correct: boolean,
  now = new Date()
): PracticeStats {
  const prunedStats = prunePracticeStats(stats, now);
  const todayKey = formatLocalDayKey(now);
  const currentDay = prunedStats.days[todayKey] ?? { success: 0, fail: 0 };

  return {
    ...prunedStats,
    days: {
      ...prunedStats.days,
      [todayKey]: {
        success: currentDay.success + (correct ? 1 : 0),
        fail: currentDay.fail + (correct ? 0 : 1),
      },
    },
  };
}

export function summarizePracticeStats(
  stats: PracticeStats,
  days: number,
  now = new Date()
): PracticeStatsSummary {
  const minDayKey = formatLocalDayKey(addDays(now, -(days - 1)));
  let success = 0;
  let fail = 0;

  for (const [dayKey, day] of Object.entries(stats.days)) {
    if (dayKey >= minDayKey) {
      success += day.success;
      fail += day.fail;
    }
  }

  const total = success + fail;

  return {
    success,
    fail,
    total,
    accuracy: total === 0 ? null : Math.round((success / total) * 100),
  };
}

export function summarizePracticeStatsPeriods(
  stats: PracticeStats,
  now = new Date()
): PracticeStatsPeriodSummary[] {
  return PRACTICE_STATS_PERIODS.map((period) => ({
    ...period,
    ...summarizePracticeStats(stats, period.days, now),
  }));
}
