import { useMemo } from "react";
import type { TopicListItem } from "../types/topic-list.ts";
import { toTopicListItems } from "../lib/topic-list.ts";
import type { SingleChoiceTopic } from "../services/content/practice-content-service.ts";
import type { ExerciseCollection } from "../types/exercises.ts";
import type { LoadableState } from "../types/ui.ts";

interface SingleChoiceTopicState {
  selectedTopic: SingleChoiceTopic | undefined;
  selectedTopicState: LoadableState<ExerciseCollection>;
  topicListState: LoadableState<TopicListItem[]>;
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

  const topicListState = useMemo<LoadableState<TopicListItem[]>>(
    () => ({
      ...topicsState,
      data: topicsState.data ? toTopicListItems(topicsState.data) : null
    }),
    [topicsState]
  );

  return {
    selectedTopic,
    selectedTopicState,
    topicListState
  };
}
