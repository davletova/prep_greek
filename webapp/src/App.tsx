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
import { usePracticeContentState } from "./hooks/use-practice-content-state.ts";
import { useTheoryContentState } from "./hooks/use-theory-content-state.ts";
import { speakGreekText } from "./lib/speech.ts";
import type { Screen, TabKey } from "./types/ui";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [tab, setTab] = useState<TabKey>("practice");
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
    selectedSingleChoiceTopic,
    selectedSingleChoiceTopicState,
    singleChoiceTopicListState,
    selectedInputTopicTitle,
    selectedInputTopicState,
    openDictionaryTopics: handleOpenDictionaryTopics,
    openWriteWordTopics: handleOpenWriteWordTopics,
    closeSingleChoiceTopic: handleClosePracticeTopic,
    openSingleChoiceTopic: handleOpenSingleChoiceTopic,
    openInputTopic: handleOpenInputTopic,
    retrySingleChoiceTopics: handleRetrySingleChoiceTopics,
    retrySelectedInputTopic: handleRetrySelectedInputTopic
  } = usePracticeContentState(screen, setScreen);

  useTelegramWebAppReady();

  const handleExit = () => {
    setScreen("home");
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
          title={selectedInputTopicTitle}
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
