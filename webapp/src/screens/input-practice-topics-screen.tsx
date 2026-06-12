import TopicListScreen from "../components/topic-list-screen.tsx";
import { inputPracticeTopicList } from "../config/practice-topics.ts";
import type { VoidHandler } from "../types/ui";

interface InputPracticeTopicsScreenProps {
  onClose: VoidHandler;
  onOpenTopic: (topicId: string) => void;
}

export default function InputPracticeTopicsScreen({
  onClose,
  onOpenTopic,
}: InputPracticeTopicsScreenProps) {
  return (
    <TopicListScreen
      title="Выбор темы"
      topics={inputPracticeTopicList}
      onClose={onClose}
      onOpenTopic={onOpenTopic}
    />
  );
}
