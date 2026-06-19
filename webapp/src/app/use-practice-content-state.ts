import { useState } from "react";
import {
  loadListeningTopicDefinitions,
  loadSingleChoiceTopicDefinitions,
} from "../services/content/practice-content-service.ts";
import type { InputExercise, ExerciseCollection } from "../types/exercises.ts";
import type {
  ListeningPracticeTopicDefinition,
  SingleChoicePracticeTopicDefinition,
} from "../types/practice-topic.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, Screen, ScreenNavigationHandler } from "../types/ui.ts";
import { useInputPracticeTopicState } from "../hooks/use-input-practice-topic-state.ts";
import { useListeningTopicState } from "../hooks/use-listening-topic-state.ts";
import { useLoadableContent } from "../hooks/use-loadable-content.ts";
import { useSingleChoiceTopicState } from "../hooks/use-single-choice-topic-state.ts";

export interface PracticeContentState {
  selectedSingleChoiceTopic: SingleChoicePracticeTopicDefinition | undefined;
  selectedSingleChoiceTopicState: LoadableState<ExerciseCollection>;
  singleChoiceTopicListState: LoadableState<TopicListItem[]>;
  selectedInputTopicTitle: string;
  selectedInputTopicState: LoadableState<InputExercise[]>;
  selectedListeningTopic: ListeningPracticeTopicDefinition | undefined;
  selectedListeningTopicState: LoadableState<ExerciseCollection>;
  listeningTopicListState: LoadableState<TopicListItem[]>;
  openSingleChoiceTopics: () => void;
  openInputTopics: () => void;
  openListeningTopics: () => void;
  closeSingleChoiceTopic: () => void;
  closeInputTopic: () => void;
  closeListeningTopic: () => void;
  openSingleChoiceTopic: (topicId: string) => void;
  openInputTopic: (topicId: string) => void;
  openListeningTopic: (topicId: string) => void;
  retrySingleChoiceTopics: () => void;
  retryListeningTopics: () => void;
  retrySelectedSingleChoiceTopic: () => void;
  retrySelectedInputTopic: () => void;
  retrySelectedListeningTopic: () => void;
}

export function usePracticeContentState(
  screen: Screen,
  setScreen: ScreenNavigationHandler
): PracticeContentState {
  const [selectedSingleChoiceTopicId, setSelectedSingleChoiceTopicId] = useState<string | null>(
    null
  );
  const [selectedInputTopicId, setSelectedInputTopicId] = useState<string | null>(null);
  const [selectedListeningTopicId, setSelectedListeningTopicId] = useState<string | null>(null);

  const { state: singleChoiceTopicsState, retry: retrySingleChoiceTopicsContent } =
    useLoadableContent(
      screen === "practice-single-choice-topics" || screen === "practice-single-choice-topic",
      loadSingleChoiceTopicDefinitions
    );

  const { state: listeningTopicsState, retry: retryListeningTopicsContent } = useLoadableContent(
    screen === "practice-listening-topics" || screen === "practice-listening-topic",
    loadListeningTopicDefinitions
  );

  const {
    selectedTopic: selectedInputTopic,
    selectedTopicState: selectedInputTopicState,
    retrySelectedTopic: retrySelectedInputTopic,
  } = useInputPracticeTopicState(screen === "practice-input-topic", selectedInputTopicId);

  const {
    selectedTopic: selectedSingleChoiceTopic,
    selectedTopicState: selectedSingleChoiceTopicState,
    topicListState: singleChoiceTopicListState,
    retrySelectedTopic: retrySelectedSingleChoiceTopic,
  } = useSingleChoiceTopicState(
    singleChoiceTopicsState,
    selectedSingleChoiceTopicId,
    screen === "practice-single-choice-topic"
  );

  const {
    selectedTopic: selectedListeningTopic,
    selectedTopicState: selectedListeningTopicState,
    topicListState: listeningTopicListState,
    retrySelectedTopic: retrySelectedListeningTopic,
  } = useListeningTopicState(
    listeningTopicsState,
    selectedListeningTopicId,
    screen === "practice-listening-topic"
  );

  const openSingleChoiceTopics = () => {
    setScreen("practice-single-choice-topics");
  };

  const openInputTopics = () => {
    setScreen("practice-input-topics");
  };

  const openListeningTopics = () => {
    setScreen("practice-listening-topics");
  };

  const closeSingleChoiceTopic = () => {
    setScreen("practice-single-choice-topics", { history: "replace" });
  };

  const closeInputTopic = () => {
    setScreen("practice-input-topics", { history: "replace" });
  };

  const closeListeningTopic = () => {
    setScreen("practice-listening-topics", { history: "replace" });
  };

  const openSingleChoiceTopic = (topicId: string) => {
    setSelectedSingleChoiceTopicId(topicId);
    setScreen("practice-single-choice-topic");
  };

  const openInputTopic = (topicId: string) => {
    setSelectedInputTopicId(topicId);
    setScreen("practice-input-topic");
  };

  const openListeningTopic = (topicId: string) => {
    setSelectedListeningTopicId(topicId);
    setScreen("practice-listening-topic");
  };

  const retrySingleChoiceTopics = () => {
    retrySingleChoiceTopicsContent();
  };

  const retryListeningTopics = () => {
    retryListeningTopicsContent();
  };

  return {
    selectedSingleChoiceTopic,
    selectedSingleChoiceTopicState,
    singleChoiceTopicListState,
    selectedInputTopicTitle: selectedInputTopic?.title || "Тренировка",
    selectedInputTopicState,
    selectedListeningTopic,
    selectedListeningTopicState,
    listeningTopicListState,
    openSingleChoiceTopics,
    openInputTopics,
    openListeningTopics,
    closeSingleChoiceTopic,
    closeInputTopic,
    closeListeningTopic,
    openSingleChoiceTopic,
    openInputTopic,
    openListeningTopic,
    retrySingleChoiceTopics,
    retryListeningTopics,
    retrySelectedSingleChoiceTopic,
    retrySelectedInputTopic,
    retrySelectedListeningTopic,
  };
}
