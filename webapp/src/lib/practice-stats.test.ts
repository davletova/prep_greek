import { describe, expect, it } from "vitest";
import {
  createEmptyPracticeStats,
  normalizePracticeStats,
  prunePracticeStats,
  recordPracticeAnswer,
  summarizePracticeStats,
  summarizePracticeStatsPeriods,
} from "./practice-stats.ts";

describe("practice stats", () => {
  it("records correct and failed answers for the local day", () => {
    const now = new Date(2026, 4, 24, 12);
    const withSuccess = recordPracticeAnswer(createEmptyPracticeStats(), true, now);
    const withFail = recordPracticeAnswer(withSuccess, false, now);

    expect(withFail).toEqual({
      version: 1,
      days: {
        "2026-05-24": {
          success: 1,
          fail: 1,
        },
      },
    });
  });

  it("summarizes today, 7, 14, and 30 day periods", () => {
    const stats = normalizePracticeStats({
      version: 1,
      days: {
        "2026-05-24": { success: 8, fail: 2 },
        "2026-05-18": { success: 2, fail: 2 },
        "2026-05-11": { success: 5, fail: 5 },
        "2026-04-25": { success: 1, fail: 3 },
      },
    });
    const now = new Date(2026, 4, 24, 12);

    expect(summarizePracticeStatsPeriods(stats, now)).toEqual([
      {
        key: "today",
        label: "Сегодня",
        days: 1,
        success: 8,
        fail: 2,
        total: 10,
        accuracy: 80,
      },
      {
        key: "7-days",
        label: "7 дней",
        days: 7,
        success: 10,
        fail: 4,
        total: 14,
        accuracy: 71,
      },
      {
        key: "14-days",
        label: "14 дней",
        days: 14,
        success: 15,
        fail: 9,
        total: 24,
        accuracy: 63,
      },
      {
        key: "30-days",
        label: "30 дней",
        days: 30,
        success: 16,
        fail: 12,
        total: 28,
        accuracy: 57,
      },
    ]);
  });

  it("returns null accuracy for empty periods", () => {
    expect(summarizePracticeStats(createEmptyPracticeStats(), 7)).toEqual({
      success: 0,
      fail: 0,
      total: 0,
      accuracy: null,
    });
  });

  it("prunes days outside retention window", () => {
    const stats = normalizePracticeStats({
      version: 1,
      days: {
        "2026-04-24": { success: 100, fail: 0 },
        "2026-04-25": { success: 1, fail: 0 },
        "2026-05-24": { success: 1, fail: 0 },
      },
    });

    expect(prunePracticeStats(stats, new Date(2026, 4, 24, 12))).toEqual({
      version: 1,
      days: {
        "2026-04-25": { success: 1, fail: 0 },
        "2026-05-24": { success: 1, fail: 0 },
      },
    });
  });

  it("normalizes invalid stored data safely", () => {
    expect(
      normalizePracticeStats({
        version: 1,
        days: {
          "2026-05-24": { success: 1.8, fail: 2.2 },
          invalid: { success: 10, fail: 10 },
          "2026-05-25": { success: "bad", fail: 1 },
        },
      })
    ).toEqual({
      version: 1,
      days: {
        "2026-05-24": { success: 1, fail: 2 },
      },
    });
  });
});
