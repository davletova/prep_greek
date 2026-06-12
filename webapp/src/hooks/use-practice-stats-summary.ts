import { useEffect, useMemo, useState } from "react";
import { summarizePracticeStatsPeriods } from "../lib/practice-stats.ts";
import { loadPracticeStats, resetPracticeStats } from "../lib/practice-stats-storage.ts";
import type { PracticeStatsPeriodSummary } from "../types/practice-stats.ts";

const EMPTY_STATS_MESSAGES = [
  "Начни с пары упражнений — статистика появится сама.",
  "Каждый ответ приближает тебя к свободному греческому.",
  "Сделай первую тренировку сегодня — точность любит регулярность.",
  "Ошибки тоже полезны: они показывают, где ты растёшь.",
  "Пять минут практики лучше, чем идеальный план на завтра.",
] as const;

function getRandomEmptyStatsMessage(): string {
  return (
    EMPTY_STATS_MESSAGES[Math.floor(Math.random() * EMPTY_STATS_MESSAGES.length)] ??
    EMPTY_STATS_MESSAGES[0]
  );
}

interface PracticeStatsSummaryState {
  statsPeriods: PracticeStatsPeriodSummary[];
  emptyMessages: string[];
  isResetConfirmOpen: boolean;
  statsError: string;
  resetError: string;
  openResetConfirm: () => void;
  closeResetConfirm: () => void;
  resetStats: () => void;
}

export function usePracticeStatsSummary(): PracticeStatsSummaryState {
  const [statsPeriods, setStatsPeriods] = useState<PracticeStatsPeriodSummary[]>(() =>
    summarizePracticeStatsPeriods({ version: 1, days: {} })
  );
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [resetError, setResetError] = useState("");
  const emptyMessages = useMemo(
    () => statsPeriods.map(() => getRandomEmptyStatsMessage()),
    [statsPeriods]
  );

  useEffect(() => {
    let isMounted = true;

    loadPracticeStats()
      .then((stats) => {
        if (isMounted) {
          setStatsPeriods(summarizePracticeStatsPeriods(stats));
          setStatsError("");
        }
      })
      .catch((error) => {
        console.warn("Failed to load practice stats", error);
        if (isMounted) {
          setStatsError("Не удалось загрузить статистику. Попробуй открыть профиль позже.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const openResetConfirm = () => {
    setResetError("");
    setIsResetConfirmOpen(true);
  };

  const closeResetConfirm = () => {
    setResetError("");
    setIsResetConfirmOpen(false);
  };

  const resetStats = () => {
    setResetError("");
    resetPracticeStats()
      .then(() => {
        setStatsPeriods(summarizePracticeStatsPeriods({ version: 1, days: {} }));
        setStatsError("");
        setIsResetConfirmOpen(false);
      })
      .catch((error) => {
        console.warn("Failed to reset practice stats", error);
        setResetError("Не удалось сбросить статистику. Попробуй ещё раз.");
      });
  };

  return {
    statsPeriods,
    emptyMessages,
    isResetConfirmOpen,
    statsError,
    resetError,
    openResetConfirm,
    closeResetConfirm,
    resetStats,
  };
}

export { EMPTY_STATS_MESSAGES };
