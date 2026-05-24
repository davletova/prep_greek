import ContentState from "../components/content-state.tsx";
import type { LoadableState, VoidHandler } from "../types/ui";

export interface SingleChoiceTopicListItem {
  id: string;
  title: string;
  subtitle: string;
}

interface PracticeTopicsScreenProps {
  topicsState: LoadableState<SingleChoiceTopicListItem[]>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onOpenTopic: (topicId: string) => void;
}

export default function PracticeTopicsScreen({
  topicsState,
  onClose,
  onRetry,
  onOpenTopic
}: PracticeTopicsScreenProps) {
  const topics = topicsState.data ?? [];

  return (
    <>
      <header className="app__header app__header--centered">
        <button
          className="back-button"
          type="button"
          onClick={onClose}
          aria-label="Назад"
        >
          ‹
        </button>
        <h1 className="app__title app__title--small app__title--centered">
          Выбор темы
        </h1>
        <div className="app__header-spacer" aria-hidden="true" />
      </header>

      <main className="app__content app__content--profile">
        {topicsState.status === "loading" ? (
          <ContentState
            title="Загружаем темы…"
            text="Подготавливаем разделы с упражнениями."
          />
        ) : topicsState.status === "error" ? (
          <ContentState
            title="Не удалось загрузить темы"
            text={topicsState.error}
            actionLabel="Попробовать снова"
            onAction={onRetry}
            tone="error"
          />
        ) : topics.length === 0 ? (
          <ContentState
            title="Темы не найдены"
            text="В папке с упражнениями нет доступных JSON-файлов."
            actionLabel="Обновить"
            onAction={onRetry}
            tone="error"
          />
        ) : (
          topics.map((topic) => (
            <button
              className="card-button"
              type="button"
              onClick={() => onOpenTopic(topic.id)}
              key={topic.id}
            >
              <div className="card-button__text">
                <span className="card-button__title">{topic.title}</span>
                <span className="card-button__subtitle">{topic.subtitle}</span>
              </div>
              <span className="card-button__chevron">›</span>
            </button>
          ))
        )}
      </main>
    </>
  );
}
