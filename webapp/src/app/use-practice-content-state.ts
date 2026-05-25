import { useState } from "react";
import {
  loadSingleChoiceTopics,
  type SingleChoiceTopic
} from "../services/content/practice-content-service.ts";
import type { InputExercise, ExerciseCollection } from "../types/exercises.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, Screen } from "../types/ui.ts";
import { useInputPracticeTopicState } from "../hooks/use-input-practice-topic-state.ts";
import { useLoadableContent } from "../hooks/use-loadable-content.ts";
import { useSingleChoiceTopicState } from "../hooks/use-single-choice-topic-state.ts";

export interface PracticeContentState {
  selectedSingleChoiceTopic: SingleChoiceTopic | undefined;
  selectedSingleChoiceTopicState: LoadableState<ExerciseCollection>;
  singleChoiceTopicListState: LoadableState<TopicListItem[]>;
  selectedInputTopicTitle: string;
  selectedInputTopicState: LoadableState<InputExercise[]>;
  openDictionaryTopics: () => void;
  openWriteWordTopics: () => void;
  closeSingleChoiceTopic: () => void;
  openSingleChoiceTopic: (topicId: string) => void;
  openInputTopic: (topicId: string) => void;
  retrySingleChoiceTopics: () => void;
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
    screen === "practice-dictionary-topics" ||
      screen === "practice-single-choice-topic",
    loadSingleChoiceTopics
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
    topicListState: singleChoiceTopicListState
  } = useSingleChoiceTopicState(
    singleChoiceTopicsState,
    selectedSingleChoiceTopicId
  );

  const openDictionaryTopics = () => {
    setScreen("practice-dictionary-topics");
  };

  const openWriteWordTopics = () => {
    setScreen("practice-write-word-topics");
  };

  const closeSingleChoiceTopic = () => {
    setScreen("practice-dictionary-topics");
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
    openDictionaryTopics,
    openWriteWordTopics,
    closeSingleChoiceTopic,
    openSingleChoiceTopic,
    openInputTopic,
    retrySingleChoiceTopics,
    retrySelectedInputTopic
  };
}
