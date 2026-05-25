import type { PracticeStatsPeriodSummary } from "../types/practice-stats.ts";

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

export default function PracticeStatsCard({ summary, emptyMessage }: PracticeStatsCardProps) {
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
