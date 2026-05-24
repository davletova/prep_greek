import { getStorageItem, removeStorageItem, setStorageItem } from "./app-storage.ts";
import {
  createEmptyPracticeStats,
  normalizePracticeStats,
  prunePracticeStats,
  recordPracticeAnswer as recordPracticeAnswerInStats,
} from "./practice-stats.ts";
import type { PracticeStats } from "../types/practice-stats.ts";

export const PRACTICE_STATS_STORAGE_KEY = "practice_stats";

function parsePracticeStatsJson(value: string | null): PracticeStats {
  if (!value) {
    return createEmptyPracticeStats();
  }

  return normalizePracticeStats(JSON.parse(value));
}

export async function loadPracticeStats(): Promise<PracticeStats> {
  const rawStats = await getStorageItem(PRACTICE_STATS_STORAGE_KEY);
  return prunePracticeStats(parsePracticeStatsJson(rawStats));
}

export async function savePracticeStats(stats: PracticeStats): Promise<void> {
  await setStorageItem(PRACTICE_STATS_STORAGE_KEY, JSON.stringify(stats));
}

let statsWriteQueue: Promise<unknown> = Promise.resolve();

export async function recordPracticeAnswer(correct: boolean): Promise<PracticeStats> {
  const write = statsWriteQueue.then(async () => {
    const stats = await loadPracticeStats();
    const nextStats = recordPracticeAnswerInStats(stats, correct);
    await savePracticeStats(nextStats);
    return nextStats;
  });

  statsWriteQueue = write.catch(() => undefined);
  return write;
}

export async function resetPracticeStats(): Promise<void> {
  const write = statsWriteQueue.then(() => removeStorageItem(PRACTICE_STATS_STORAGE_KEY));

  statsWriteQueue = write.catch(() => undefined);
  await write;
}
