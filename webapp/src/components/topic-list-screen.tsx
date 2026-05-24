import ContentState from "./content-state.tsx";
import type { LoadStatus, VoidHandler } from "../types/ui";

export interface TopicListItem {
  id: string;
  title: string;
  subtitle: string;
}

interface TopicListScreenProps {
  title: string;
  topics: readonly TopicListItem[];
  onClose: VoidHandler;
  onOpenTopic: (topicId: string) => void;
  status?: LoadStatus;
  error?: string;
  loadingTitle?: string;
  loadingText?: string;
  errorTitle?: string;
  emptyTitle?: string;
  emptyText?: string;
  onRetry?: VoidHandler;
}

export default function TopicListScreen({
  title,
  topics,
  onClose,
  onOpenTopic,
  status = "success",
  error = "",
  loadingTitle = "Загружаем темы…",
  loadingText = "Подготавливаем разделы с упражнениями.",
  errorTitle = "Не удалось загрузить темы",
  emptyTitle = "Темы не найдены",
  emptyText = "Нет доступных тем.",
  onRetry
}: TopicListScreenProps) {
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
          {title}
        </h1>
        <div className="app__header-spacer" aria-hidden="true" />
      </header>

      <main className="app__content app__content--profile">
        {status === "loading" ? (
          <ContentState title={loadingTitle} text={loadingText} />
        ) : status === "error" ? (
          <ContentState
            title={errorTitle}
            text={error}
            {...(onRetry
              ? { actionLabel: "Попробовать снова", onAction: onRetry }
              : {})}
            tone="error"
          />
        ) : topics.length === 0 ? (
          <ContentState
            title={emptyTitle}
            text={emptyText}
            {...(onRetry ? { actionLabel: "Обновить", onAction: onRetry } : {})}
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
