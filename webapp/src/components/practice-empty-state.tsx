import ContentState from "./content-state.tsx";

interface PracticeEmptyStateProps {
  title: string;
  text: string;
}

export default function PracticeEmptyState({ title, text }: PracticeEmptyStateProps) {
  return <ContentState title={title} text={text} tone="error" />;
}
