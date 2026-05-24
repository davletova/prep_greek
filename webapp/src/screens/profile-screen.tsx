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

function formatAnswerCount(value: number, forms: [string, string, string]): string {
  const absValue = Math.abs(value);
  const lastTwoDigits = absValue % 100;
  const lastDigit = absValue % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} ${forms[2]}`;
  }

  if (lastDigit === 1) {
    return `${value} ${forms[0]}`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} ${forms[1]}`;
  }

  return `${value} ${forms[2]}`;
}

interface PracticeStatsCardProps {
  summary: PracticeStatsPeriodSummary;
  emptyMessage: string;
}

function PracticeStatsCard({ summary, emptyMessage }: PracticeStatsCardProps) {
  const accuracy = summary.accuracy ?? 0;
  const correctText = formatAnswerCount(summary.success, [
    "правильный",
    "правильных",
    "правильных",
  ]);
  const failText = formatAnswerCount(summary.fail, ["ошибка", "ошибки", "ошибок"]);

  return (
    <article className="stats-card">
      <div className="stats-card__header">
        <h3 className="stats-card__title">{summary.label}</h3>
        {summary.total > 0 ? <span className="stats-card__accuracy">{accuracy}%</span> : null}
      </div>

      {summary.total > 0 ? (
        <>
          <div
            className="stats-card__bar"
            role="meter"
            aria-label={`Точность за период ${summary.label}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={accuracy}
          >
            <div className="stats-card__bar-fill" style={{ width: `${accuracy}%` }} />
          </div>
          <p className="stats-card__details">
            {correctText} · {failText}
          </p>
        </>
      ) : (
        <p className="stats-card__empty">{emptyMessage}</p>
      )}
    </article>
  );
}

export default function ProfileScreen() {
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

  const handleOpenResetConfirm = () => {
    setResetError("");
    setIsResetConfirmOpen(true);
  };

  const handleResetStats = () => {
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

  return (
    <>
      <header className="app__header">
        <h1 className="app__title">Профиль</h1>
      </header>

      <main className="app__content app__content--profile">
        <div className="settings">
          <div className="settings__label">Уровень языка</div>
          <button className="dropdown" type="button">
            A1
            <span className="dropdown__chevron">▾</span>
          </button>
        </div>

        <section className="practice-stats" aria-labelledby="practice-stats-title">
          <div className="practice-stats__header">
            <div>
              <h2 className="practice-stats__title" id="practice-stats-title">
                Статистика практики
              </h2>
              <p className="practice-stats__subtitle">Точность по твоим ответам</p>
            </div>
          </div>

          {statsError ? <p className="practice-stats__error">{statsError}</p> : null}

          <div className="practice-stats__cards">
            {statsPeriods.map((summary, index) => (
              <PracticeStatsCard
                key={summary.key}
                summary={summary}
                emptyMessage={emptyMessages[index] ?? EMPTY_STATS_MESSAGES[0]}
              />
            ))}
          </div>

          <button className="practice-stats__reset" type="button" onClick={handleOpenResetConfirm}>
            Сбросить статистику
          </button>
        </section>
      </main>

      {isResetConfirmOpen ? (
        <div className="modal-overlay" role="presentation">
          <section
            className="confirm-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-stats-title"
          >
            <h2 className="confirm-sheet__title" id="reset-stats-title">
              Сбросить статистику?
            </h2>
            <p className="confirm-sheet__text">
              Удалятся только данные по правильным и ошибочным ответам. Уровень языка и остальной
              прогресс не изменятся.
            </p>
            {resetError ? <p className="confirm-sheet__error">{resetError}</p> : null}
            <div className="confirm-sheet__actions">
              <button
                className="confirm-sheet__button confirm-sheet__button--secondary"
                type="button"
                onClick={() => {
                  setResetError("");
                  setIsResetConfirmOpen(false);
                }}
              >
                Отмена
              </button>
              <button
                className="confirm-sheet__button confirm-sheet__button--danger"
                type="button"
                onClick={handleResetStats}
              >
                Сбросить
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
