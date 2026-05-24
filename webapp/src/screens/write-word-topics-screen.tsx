import TopicListScreen from "../components/topic-list-screen.tsx";
import { inputPracticeTopicList } from "../config/practice-topics.ts";
import type { VoidHandler } from "../types/ui";

interface WriteWordTopicsScreenProps {
  onClose: VoidHandler;
  onOpenVerbConjugation: VoidHandler;
}

export default function WriteWordTopicsScreen({
  onClose,
  onOpenVerbConjugation
}: WriteWordTopicsScreenProps) {
  return (
    <TopicListScreen
      title="Выбор темы"
      topics={inputPracticeTopicList}
      onClose={onClose}
      onOpenTopic={onOpenVerbConjugation}
    />
  );
}
