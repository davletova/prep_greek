import ConfirmSheet from "../components/confirm-sheet.tsx";
import PracticeStatsCard from "../components/practice-stats-card.tsx";
import {
  EMPTY_STATS_MESSAGES,
  usePracticeStatsSummary,
} from "../hooks/use-practice-stats-summary.ts";

export default function ProfileScreen() {
  const {
    statsPeriods,
    emptyMessages,
    isResetConfirmOpen,
    statsError,
    resetError,
    openResetConfirm: handleOpenResetConfirm,
    closeResetConfirm: handleCloseResetConfirm,
    resetStats: handleResetStats,
  } = usePracticeStatsSummary();

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
        <ConfirmSheet
          title="Сбросить статистику?"
          text="Удалятся только данные по правильным и ошибочным ответам. Уровень языка и остальной прогресс не изменятся."
          error={resetError}
          confirmLabel="Сбросить"
          onCancel={handleCloseResetConfirm}
          onConfirm={handleResetStats}
        />
      ) : null}
    </>
  );
}
