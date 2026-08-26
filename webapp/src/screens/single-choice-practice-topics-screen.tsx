import TopicListScreen from "../components/topic-list-screen.tsx";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, VoidHandler } from "../types/ui";

interface SingleChoicePracticeTopicsScreenProps {
  topicsState: LoadableState<TopicListItem[]>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onOpenTopic: (topicId: string) => void;
  title?: string | undefined;
}

export default function SingleChoicePracticeTopicsScreen({
  topicsState,
  onClose,
  onRetry,
  onOpenTopic,
  title = "Выбор темы",
}: SingleChoicePracticeTopicsScreenProps) {
  return (
    <TopicListScreen
      title={title}
      topics={topicsState.data ?? []}
      status={topicsState.status}
      error={topicsState.error}
      onClose={onClose}
      onRetry={onRetry}
      onOpenTopic={onOpenTopic}
      loadingTitle="Загружаем темы…"
      loadingText="Подготавливаем разделы с упражнениями."
      errorTitle="Не удалось загрузить темы"
      emptyTitle="Темы не найдены"
      emptyText="В папке с упражнениями нет доступных JSON-файлов."
    />
  );
}
