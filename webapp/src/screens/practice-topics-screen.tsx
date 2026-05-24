import TopicListScreen from "../components/topic-list-screen.tsx";
import type { TopicListItem } from "../components/topic-list-screen.tsx";
import type { LoadableState, VoidHandler } from "../types/ui";

export type SingleChoiceTopicListItem = TopicListItem;

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
  return (
    <TopicListScreen
      title="Выбор темы"
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
