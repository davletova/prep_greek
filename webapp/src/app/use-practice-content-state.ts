import { useState } from "react";
import { loadSingleChoiceTopicDefinitions } from "../services/content/practice-content-service.ts";
import type { InputExercise, ExerciseCollection } from "../types/exercises.ts";
import type { SingleChoicePracticeTopicDefinition } from "../types/practice-topic.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, Screen } from "../types/ui.ts";
import { useInputPracticeTopicState } from "../hooks/use-input-practice-topic-state.ts";
import { useLoadableContent } from "../hooks/use-loadable-content.ts";
import { useSingleChoiceTopicState } from "../hooks/use-single-choice-topic-state.ts";

export interface PracticeContentState {
  selectedSingleChoiceTopic: SingleChoicePracticeTopicDefinition | undefined;
  selectedSingleChoiceTopicState: LoadableState<ExerciseCollection>;
  singleChoiceTopicListState: LoadableState<TopicListItem[]>;
  selectedInputTopicTitle: string;
  selectedInputTopicState: LoadableState<InputExercise[]>;
  openSingleChoiceTopics: () => void;
  openInputTopics: () => void;
  closeSingleChoiceTopic: () => void;
  openSingleChoiceTopic: (topicId: string) => void;
  openInputTopic: (topicId: string) => void;
  retrySingleChoiceTopics: () => void;
  retrySelectedSingleChoiceTopic: () => void;
  retrySelectedInputTopic: () => void;
}

export function usePracticeContentState(
  screen: Screen,
  setScreen: (screen: Screen) => void
): PracticeContentState {
  const [selectedSingleChoiceTopicId, setSelectedSingleChoiceTopicId] =
    useState<string | null>(null);
  const [selectedInputTopicId, setSelectedInputTopicId] =
    useState<string | null>(null);

  const {
    state: singleChoiceTopicsState,
    retry: retrySingleChoiceTopicsContent
  } = useLoadableContent(
    screen === "practice-single-choice-topics" ||
      screen === "practice-single-choice-topic",
    loadSingleChoiceTopicDefinitions
  );

  const {
    selectedTopic: selectedInputTopic,
    selectedTopicState: selectedInputTopicState,
    retrySelectedTopic: retrySelectedInputTopic
  } = useInputPracticeTopicState(
    screen === "practice-input-topic",
    selectedInputTopicId
  );

  const {
    selectedTopic: selectedSingleChoiceTopic,
    selectedTopicState: selectedSingleChoiceTopicState,
    topicListState: singleChoiceTopicListState,
    retrySelectedTopic: retrySelectedSingleChoiceTopic
  } = useSingleChoiceTopicState(
    singleChoiceTopicsState,
    selectedSingleChoiceTopicId,
    screen === "practice-single-choice-topic"
  );

  const openSingleChoiceTopics = () => {
    setScreen("practice-single-choice-topics");
  };

  const openInputTopics = () => {
    setScreen("practice-input-topics");
  };

  const closeSingleChoiceTopic = () => {
    setScreen("practice-single-choice-topics");
  };

  const openSingleChoiceTopic = (topicId: string) => {
    setSelectedSingleChoiceTopicId(topicId);
    setScreen("practice-single-choice-topic");
  };

  const openInputTopic = (topicId: string) => {
    setSelectedInputTopicId(topicId);
    setScreen("practice-input-topic");
  };

  const retrySingleChoiceTopics = () => {
    retrySingleChoiceTopicsContent();
  };

  return {
    selectedSingleChoiceTopic,
    selectedSingleChoiceTopicState,
    singleChoiceTopicListState,
    selectedInputTopicTitle: selectedInputTopic?.title || "Тренировка",
    selectedInputTopicState,
    openSingleChoiceTopics,
    openInputTopics,
    closeSingleChoiceTopic,
    openSingleChoiceTopic,
    openInputTopic,
    retrySingleChoiceTopics,
    retrySelectedSingleChoiceTopic,
    retrySelectedInputTopic
  };
}
