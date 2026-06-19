import TopicListScreen from "../components/topic-list-screen.tsx";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, VoidHandler } from "../types/ui";

interface ListeningPracticeTopicsScreenProps {
  topicsState: LoadableState<TopicListItem[]>;
  onClose: VoidHandler;
  onRetry: VoidHandler;
  onOpenTopic: (topicId: string) => void;
}

export default function ListeningPracticeTopicsScreen({
  topicsState,
  onClose,
  onRetry,
  onOpenTopic,
}: ListeningPracticeTopicsScreenProps) {
  return (
    <TopicListScreen
      title="Аудирование"
      topics={topicsState.data ?? []}
      status={topicsState.status}
      error={topicsState.error}
      onClose={onClose}
      onRetry={onRetry}
      onOpenTopic={onOpenTopic}
      loadingTitle="Загружаем темы…"
      loadingText="Подготавливаем упражнения на слух."
      errorTitle="Не удалось загрузить темы"
      emptyTitle="Темы не найдены"
      emptyText="В папке с аудированием нет доступных JSON-файлов."
    />
  );
}
