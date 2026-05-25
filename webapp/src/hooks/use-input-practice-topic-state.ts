import { useCallback, useMemo } from "react";
import { inputPracticeTopicList } from "../config/practice-topics.ts";
import { loadInputPracticeTopic } from "../services/content/practice-content-service.ts";
import type { InputPracticeTopicDefinition } from "../types/practice-topic.ts";
import type { InputExercise } from "../types/exercises.ts";
import type { LoadableState } from "../types/ui.ts";
import { useLoadableContent } from "./use-loadable-content.ts";

interface InputPracticeTopicState {
  selectedTopic: InputPracticeTopicDefinition | undefined;
  selectedTopicState: LoadableState<InputExercise[]>;
  retrySelectedTopic: () => void;
}

export function useInputPracticeTopicState(
  isActive: boolean,
  selectedTopicId: string | null
): InputPracticeTopicState {
  const selectedTopic = useMemo(
    () => inputPracticeTopicList.find((topic) => topic.id === selectedTopicId),
    [selectedTopicId]
  );

  const loadSelectedTopic = useCallback(() => {
    if (!selectedTopic) {
      return Promise.reject(new Error("Не удалось найти выбранную тему"));
    }

    return loadInputPracticeTopic(selectedTopic);
  }, [selectedTopic]);

  const { state: selectedTopicState, retry: retrySelectedTopic } = useLoadableContent(
    isActive,
    loadSelectedTopic
  );

  return {
    selectedTopic,
    selectedTopicState,
    retrySelectedTopic
  };
}
