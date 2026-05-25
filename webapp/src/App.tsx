import { useState } from "react";
import { useTelegramWebAppReady } from "./app/use-telegram-web-app-ready.ts";
import TabBar from "./components/tab-bar.tsx";
import AlphabetScreen from "./screens/alphabet-screen.tsx";
import DiphthongsScreen from "./screens/diphthongs-screen.tsx";
import HomeScreen from "./screens/home-screen.tsx";
import InputPracticeTopicScreen from "./screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "./screens/practice-topic-screen.tsx";
import PracticeTopicsScreen from "./screens/practice-topics-screen.tsx";
import WriteWordTopicsScreen from "./screens/write-word-topics-screen.tsx";
import { useInputPracticeTopicState } from "./hooks/use-input-practice-topic-state.ts";
import { useLoadableContent } from "./hooks/use-loadable-content.ts";
import { useSingleChoiceTopicState } from "./hooks/use-single-choice-topic-state.ts";
import { useTheoryContentState } from "./hooks/use-theory-content-state.ts";
import { speakGreekText } from "./lib/speech.ts";
import {
  loadSingleChoiceTopics,
  type SingleChoiceTopic
} from "./services/content/practice-content-service.ts";
import type { Screen, TabKey } from "./types/ui";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<TabKey>("practice");
  const [selectedSingleChoiceTopicId, setSelectedSingleChoiceTopicId] =
    useState<string | null>(null);
  const [selectedInputTopicId, setSelectedInputTopicId] =
    useState<string | null>(null);

  const {
    alphabetState,
    pageIndex,
    diphthongsState,
    diphthongIndex,
    openAlphabet: handleOpenAlphabet,
    openDiphthongs: handleOpenDiphthongs,
    prevAlphabetPage: handlePrevAlphabetPage,
    nextAlphabetPage: handleNextAlphabetPage,
    retryAlphabet: handleRetryAlphabet,
    prevDiphthong: handlePrevDiphthong,
    nextDiphthong: handleNextDiphthong,
    retryDiphthongs: handleRetryDiphthongs
  } = useTheoryContentState(screen, setScreen);

  const {
    state: singleChoiceTopicsState,
    retry: retrySingleChoiceTopics
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

  useTelegramWebAppReady();

  const {
    selectedTopic: selectedSingleChoiceTopic,
    selectedTopicState: selectedSingleChoiceTopicState,
    topicListState: singleChoiceTopicListState
  } = useSingleChoiceTopicState(
    singleChoiceTopicsState,
    selectedSingleChoiceTopicId
  );

  const handleOpenDictionaryTopics = () => {
    setScreen("practice-dictionary-topics");
  };

  const handleOpenWriteWordTopics = () => {
    setScreen("practice-write-word-topics");
  };

  const handleExit = () => {
    setScreen("home");
  };

  const handleClosePracticeTopic = () => {
    setScreen("practice-dictionary-topics");
  };

  const handleOpenSingleChoiceTopic = (topicId: string) => {
    setSelectedSingleChoiceTopicId(topicId);
    setScreen("practice-single-choice-topic");
  };

  const handleOpenInputTopic = (topicId: string) => {
    setSelectedInputTopicId(topicId);
    setScreen("practice-input-topic");
  };

  const handleRetrySingleChoiceTopics = () => {
    retrySingleChoiceTopics();
  };

  const handleRetrySelectedInputTopic = () => {
    retrySelectedInputTopic();
  };

  const isHomeScreen = screen === "home";

  return (
    <div className={`app ${isHomeScreen ? "" : "app--detail"}`}>
      {isHomeScreen ? (
        <HomeScreen
          tab={tab}
          onOpenAlphabet={handleOpenAlphabet}
          onOpenDiphthongs={handleOpenDiphthongs}
          onOpenDictionaryTopics={handleOpenDictionaryTopics}
          onOpenWriteWordTopics={handleOpenWriteWordTopics}
        />
      ) : screen === "alphabet" ? (
        <AlphabetScreen
          alphabetState={alphabetState}
          pageIndex={pageIndex}
          onClose={handleExit}
          onPrev={handlePrevAlphabetPage}
          onNext={handleNextAlphabetPage}
          onRetry={handleRetryAlphabet}
          onSpeak={speakGreekText}
        />
      ) : screen === "diphthongs" ? (
        <DiphthongsScreen
          diphthongsState={diphthongsState}
          diphthongIndex={diphthongIndex}
          onClose={handleExit}
          onPrev={handlePrevDiphthong}
          onNext={handleNextDiphthong}
          onRetry={handleRetryDiphthongs}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-write-word-topics" ? (
        <WriteWordTopicsScreen
          onClose={handleExit}
          onOpenTopic={handleOpenInputTopic}
        />
      ) : screen === "practice-input-topic" ? (
        <InputPracticeTopicScreen
          title={selectedInputTopic?.title || "Тренировка"}
          topicState={selectedInputTopicState}
          onClose={handleOpenWriteWordTopics}
          onRetry={handleRetrySelectedInputTopic}
          onSpeak={speakGreekText}
        />
      ) : screen === "practice-single-choice-topic" ? (
        <PracticeTopicScreen
          title={selectedSingleChoiceTopic?.title || "Тренировка"}
          topicState={selectedSingleChoiceTopicState}
          onClose={handleClosePracticeTopic}
          onRetry={handleRetrySingleChoiceTopics}
          onSpeak={speakGreekText}
        />
      ) : (
        <PracticeTopicsScreen
          topicsState={singleChoiceTopicListState}
          onClose={handleExit}
          onRetry={handleRetrySingleChoiceTopics}
          onOpenTopic={handleOpenSingleChoiceTopic}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={setTab} /> : null}
    </div>
  );
}
