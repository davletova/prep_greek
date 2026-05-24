import { useMemo } from "react";
import type { SingleChoiceTopicListItem } from "../screens/practice-topics-screen.tsx";
import type { SingleChoiceTopic } from "../services/content/practice-content-service.ts";
import type { ExerciseCollection } from "../types/exercises.ts";
import type { LoadableState } from "../types/ui.ts";

interface SingleChoiceTopicState {
  selectedTopic: SingleChoiceTopic | undefined;
  selectedTopicState: LoadableState<ExerciseCollection>;
  topicListState: LoadableState<SingleChoiceTopicListItem[]>;
}

function createTopicState(
  topicsState: LoadableState<SingleChoiceTopic[]>,
  selectedTopic: SingleChoiceTopic | undefined
): LoadableState<ExerciseCollection> {
  if (topicsState.status === "loading" || topicsState.status === "idle") {
    return {
      data: null,
      status: "loading",
      error: ""
    };
  }

  if (topicsState.status === "error") {
    return {
      data: null,
      status: "error",
      error: topicsState.error
    };
  }

  if (!selectedTopic) {
    return {
      data: null,
      status: "error",
      error: "Не удалось найти выбранную тему"
    };
  }

  return {
    data: selectedTopic.collection,
    status: "success",
    error: ""
  };
}

export function useSingleChoiceTopicState(
  topicsState: LoadableState<SingleChoiceTopic[]>,
  selectedTopicId: string | null
): SingleChoiceTopicState {
  const selectedTopic = useMemo(
    () => topicsState.data?.find((topic) => topic.id === selectedTopicId),
    [topicsState.data, selectedTopicId]
  );

  const selectedTopicState = useMemo(
    () => createTopicState(topicsState, selectedTopic),
    [topicsState, selectedTopic]
  );

  const topicListState = useMemo<LoadableState<SingleChoiceTopicListItem[]>>(
    () => ({
      ...topicsState,
      data:
        topicsState.data?.map(({ id, title, subtitle }) => ({
          id,
          title,
          subtitle
        })) ?? null
    }),
    [topicsState]
  );

  return {
    selectedTopic,
    selectedTopicState,
    topicListState
  };
}
