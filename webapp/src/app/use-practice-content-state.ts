import { useCallback, useMemo, useState } from "react";
import {
  loadListeningTopicDefinitions,
  loadSingleChoiceGroupTopicDefinitions,
  loadSingleChoiceTopicDefinitions,
} from "../services/content/practice-content-service.ts";
import type { InputExercise, ExerciseCollection } from "../types/exercises.ts";
import {
  isSingleChoicePracticeGroupDefinition,
  type ListeningPracticeTopicDefinition,
  type SingleChoicePracticeGroupDefinition,
  type SingleChoicePracticeTopicDefinition,
} from "../types/practice-topic.ts";
import { toTopicListItems } from "../lib/topic-list.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, Screen, ScreenNavigationHandler } from "../types/ui.ts";
import { useInputPracticeTopicState } from "../hooks/use-input-practice-topic-state.ts";
import { useListeningTopicState } from "../hooks/use-listening-topic-state.ts";
import { useLoadableContent } from "../hooks/use-loadable-content.ts";
import { useSingleChoiceTopicState } from "../hooks/use-single-choice-topic-state.ts";

export interface PracticeContentState {
  selectedSingleChoiceTopic: SingleChoicePracticeTopicDefinition | undefined;
  selectedSingleChoiceTopicState: LoadableState<ExerciseCollection>;
  selectedSingleChoiceGroup: SingleChoicePracticeGroupDefinition | undefined;
  singleChoiceTopicListState: LoadableState<TopicListItem[]>;
  singleChoiceGroupTopicListState: LoadableState<TopicListItem[]>;
  selectedInputTopicTitle: string;
  selectedInputTopicState: LoadableState<InputExercise[]>;
  selectedListeningTopic: ListeningPracticeTopicDefinition | undefined;
  selectedListeningTopicState: LoadableState<ExerciseCollection>;
  listeningTopicListState: LoadableState<TopicListItem[]>;
  openSingleChoiceTopics: () => void;
  openInputTopics: () => void;
  openListeningTopics: () => void;
  closeSingleChoiceTopic: () => void;
  closeSingleChoiceGroup: () => void;
  closeInputTopic: () => void;
  closeListeningTopic: () => void;
  openSingleChoiceTopic: (topicId: string) => void;
  openSingleChoiceGroupTopic: (topicId: string) => void;
  openInputTopic: (topicId: string) => void;
  openListeningTopic: (topicId: string) => void;
  retrySingleChoiceTopics: () => void;
  retrySingleChoiceGroupTopics: () => void;
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
  const [selectedSingleChoiceGroupId, setSelectedSingleChoiceGroupId] = useState<string | null>(
    null
  );
  const [selectedInputTopicId, setSelectedInputTopicId] = useState<string | null>(null);
  const [selectedListeningTopicId, setSelectedListeningTopicId] = useState<string | null>(null);

  const { state: singleChoiceTopicsState, retry: retrySingleChoiceTopicsContent } =
    useLoadableContent(
      screen === "practice-single-choice-topics" ||
        screen === "practice-single-choice-group" ||
        screen === "practice-single-choice-topic",
      loadSingleChoiceTopicDefinitions
    );

  const { state: listeningTopicsState, retry: retryListeningTopicsContent } = useLoadableContent(
    screen === "practice-listening-topics" || screen === "practice-listening-topic",
    loadListeningTopicDefinitions
  );

  const selectedSingleChoiceGroup = useMemo(
    () =>
      singleChoiceTopicsState.data?.find(
        (entry) =>
          entry.id === selectedSingleChoiceGroupId && isSingleChoicePracticeGroupDefinition(entry)
      ) as SingleChoicePracticeGroupDefinition | undefined,
    [selectedSingleChoiceGroupId, singleChoiceTopicsState.data]
  );

  const loadSelectedSingleChoiceGroup = useCallback(() => {
    if (!selectedSingleChoiceGroup) {
      return Promise.reject(new Error("Не удалось найти выбранный раздел"));
    }

    return loadSingleChoiceGroupTopicDefinitions(selectedSingleChoiceGroup);
  }, [selectedSingleChoiceGroup]);

  const { state: singleChoiceGroupTopicsState, retry: retrySingleChoiceGroupTopics } =
    useLoadableContent(
      (screen === "practice-single-choice-group" || screen === "practice-single-choice-topic") &&
        Boolean(selectedSingleChoiceGroup),
      loadSelectedSingleChoiceGroup,
      selectedSingleChoiceGroup?.id
    );

  const rootSingleChoiceTopicsState = useMemo<LoadableState<SingleChoicePracticeTopicDefinition[]>>(
    () => ({
      ...singleChoiceTopicsState,
      data:
        singleChoiceTopicsState.data?.filter(
          (entry): entry is SingleChoicePracticeTopicDefinition =>
            !isSingleChoicePracticeGroupDefinition(entry)
        ) ?? null,
    }),
    [singleChoiceTopicsState]
  );

  const availableSingleChoiceTopicsState = selectedSingleChoiceGroupId
    ? singleChoiceGroupTopicsState
    : rootSingleChoiceTopicsState;

  const singleChoiceTopicListState = useMemo<LoadableState<TopicListItem[]>>(
    () => ({
      ...singleChoiceTopicsState,
      data: singleChoiceTopicsState.data ? toTopicListItems(singleChoiceTopicsState.data) : null,
    }),
    [singleChoiceTopicsState]
  );

  const singleChoiceGroupTopicListState = useMemo<LoadableState<TopicListItem[]>>(
    () => ({
      ...singleChoiceGroupTopicsState,
      data: singleChoiceGroupTopicsState.data
        ? toTopicListItems(singleChoiceGroupTopicsState.data)
        : null,
    }),
    [singleChoiceGroupTopicsState]
  );

  const {
    selectedTopic: selectedInputTopic,
    selectedTopicState: selectedInputTopicState,
    retrySelectedTopic: retrySelectedInputTopic,
  } = useInputPracticeTopicState(screen === "practice-input-topic", selectedInputTopicId);

  const {
    selectedTopic: selectedSingleChoiceTopic,
    selectedTopicState: selectedSingleChoiceTopicState,
    retrySelectedTopic: retrySelectedSingleChoiceTopic,
  } = useSingleChoiceTopicState(
    availableSingleChoiceTopicsState,
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
    setScreen(
      selectedSingleChoiceGroupId
        ? "practice-single-choice-group"
        : "practice-single-choice-topics",
      { history: "replace" }
    );
  };

  const closeSingleChoiceGroup = () => {
    setSelectedSingleChoiceGroupId(null);
    setSelectedSingleChoiceTopicId(null);
    setScreen("practice-single-choice-topics", { history: "replace" });
  };

  const closeInputTopic = () => {
    setScreen("practice-input-topics", { history: "replace" });
  };

  const closeListeningTopic = () => {
    setScreen("practice-listening-topics", { history: "replace" });
  };

  const openSingleChoiceTopic = (topicId: string) => {
    const entry = singleChoiceTopicsState.data?.find((candidate) => candidate.id === topicId);

    if (!entry) {
      return;
    }

    setSelectedSingleChoiceTopicId(null);

    if (isSingleChoicePracticeGroupDefinition(entry)) {
      setSelectedSingleChoiceGroupId(entry.id);
      setScreen("practice-single-choice-group");
      return;
    }

    setSelectedSingleChoiceGroupId(null);
    setSelectedSingleChoiceTopicId(entry.id);
    setScreen("practice-single-choice-topic");
  };

  const openSingleChoiceGroupTopic = (topicId: string) => {
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
    selectedSingleChoiceGroup,
    singleChoiceTopicListState,
    singleChoiceGroupTopicListState,
    selectedInputTopicTitle: selectedInputTopic?.title || "Тренировка",
    selectedInputTopicState,
    selectedListeningTopic,
    selectedListeningTopicState,
    listeningTopicListState,
    openSingleChoiceTopics,
    openInputTopics,
    openListeningTopics,
    closeSingleChoiceTopic,
    closeSingleChoiceGroup,
    closeInputTopic,
    closeListeningTopic,
    openSingleChoiceTopic,
    openSingleChoiceGroupTopic,
    openInputTopic,
    openListeningTopic,
    retrySingleChoiceTopics,
    retrySingleChoiceGroupTopics,
    retryListeningTopics,
    retrySelectedSingleChoiceTopic,
    retrySelectedInputTopic,
    retrySelectedListeningTopic,
  };
}
