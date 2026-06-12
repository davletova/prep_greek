import ContentState from "./content-state.tsx";
import type { VoidHandler } from "../types/ui.ts";

interface PracticeLoadingStateProps {
  status: "loading" | "error";
  error: string;
  loadingText: string;
  onRetry: VoidHandler;
}

export default function PracticeLoadingState({
  status,
  error,
  loadingText,
  onRetry,
}: PracticeLoadingStateProps) {
  if (status === "loading") {
    return <ContentState title="Загружаем упражнения…" text={loadingText} />;
  }

  return (
    <ContentState
      title="Не удалось загрузить упражнения"
      text={error}
      actionLabel="Попробовать снова"
      onAction={onRetry}
      tone="error"
    />
  );
}
