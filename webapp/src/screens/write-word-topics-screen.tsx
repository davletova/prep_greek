import TopicListScreen from "../components/topic-list-screen.tsx";
import type { VoidHandler } from "../types/ui";

interface WriteWordTopicsScreenProps {
  onClose: VoidHandler;
  onOpenVerbConjugation: VoidHandler;
}

const writeWordTopics = [
  {
    id: "alpha-type-verb-conjugation",
    title: "Спряжение глаголов",
    subtitle: "Введите правильную форму слова"
  }
];

export default function WriteWordTopicsScreen({
  onClose,
  onOpenVerbConjugation
}: WriteWordTopicsScreenProps) {
  return (
    <TopicListScreen
      title="Выбор темы"
      topics={writeWordTopics}
      onClose={onClose}
      onOpenTopic={onOpenVerbConjugation}
    />
  );
}
