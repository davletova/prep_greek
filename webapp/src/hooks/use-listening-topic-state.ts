import { useCallback, useMemo } from "react";
import { toTopicListItems } from "../lib/topic-list.ts";
import { loadListeningPracticeTopic } from "../services/content/practice-content-service.ts";
import type { ExerciseCollection } from "../types/exercises.ts";
import type {
  ListeningPracticeTopic,
  ListeningPracticeTopicDefinition,
} from "../types/practice-topic.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState } from "../types/ui.ts";
import { useLoadableContent } from "./use-loadable-content.ts";

interface ListeningTopicState {
  selectedTopic: ListeningPracticeTopicDefinition | undefined;
  selectedTopicState: LoadableState<ExerciseCollection>;
  topicListState: LoadableState<TopicListItem[]>;
  retrySelectedTopic: () => void;
}

function createSelectedCollectionState(
  topicsState: LoadableState<ListeningPracticeTopicDefinition[]>,
  selectedTopic: ListeningPracticeTopicDefinition | undefined,
  loadedTopicState: LoadableState<ListeningPracticeTopic>
): LoadableState<ExerciseCollection> {
  if (topicsState.status === "loading" || topicsState.status === "idle") {
    return {
      data: null,
      status: "loading",
      error: "",
    };
  }

  if (topicsState.status === "error") {
    return {
      data: null,
      status: "error",
      error: topicsState.error,
    };
  }

  if (!selectedTopic) {
    return {
      data: null,
      status: "error",
      error: "Не удалось найти выбранную тему",
    };
  }

  if (loadedTopicState.status === "idle") {
    return {
      data: null,
      status: "loading",
      error: "",
    };
  }

  return {
    ...loadedTopicState,
    data: loadedTopicState.data?.collection ?? null,
  };
}

export function useListeningTopicState(
  topicsState: LoadableState<ListeningPracticeTopicDefinition[]>,
  selectedTopicId: string | null,
  isSelectedTopicActive: boolean
): ListeningTopicState {
  const selectedTopic = useMemo(
    () => topicsState.data?.find((topic) => topic.id === selectedTopicId),
    [topicsState.data, selectedTopicId]
  );

  const loadSelectedTopic = useCallback(() => {
    if (!selectedTopic) {
      return Promise.reject(new Error("Не удалось найти выбранную тему"));
    }

    return loadListeningPracticeTopic(selectedTopic);
  }, [selectedTopic]);

  const { state: loadedTopicState, retry: retrySelectedTopic } = useLoadableContent(
    isSelectedTopicActive && topicsState.status === "success" && Boolean(selectedTopic),
    loadSelectedTopic,
    selectedTopic?.id
  );

  const selectedTopicState = useMemo(
    () => createSelectedCollectionState(topicsState, selectedTopic, loadedTopicState),
    [loadedTopicState, selectedTopic, topicsState]
  );

  const topicListState = useMemo<LoadableState<TopicListItem[]>>(
    () => ({
      ...topicsState,
      data: topicsState.data ? toTopicListItems(topicsState.data) : null,
    }),
    [topicsState]
  );

  return {
    selectedTopic,
    selectedTopicState,
    topicListState,
    retrySelectedTopic,
  };
}
