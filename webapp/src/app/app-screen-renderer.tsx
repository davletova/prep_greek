import TabBar from "../components/tab-bar.tsx";
import AlphabetScreen from "../screens/alphabet-screen.tsx";
import DiphthongsScreen from "../screens/diphthongs-screen.tsx";
import HomeScreen from "../screens/home-screen.tsx";
import InputPracticeTopicScreen from "../screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "../screens/practice-topic-screen.tsx";
import SingleChoicePracticeTopicsScreen from "../screens/single-choice-practice-topics-screen.tsx";
import InputPracticeTopicsScreen from "../screens/input-practice-topics-screen.tsx";
import type { Screen, SpeakHandler, TabKey, VoidHandler } from "../types/ui.ts";
import type { PracticeContentState } from "./use-practice-content-state.ts";
import type { TheoryContentState } from "./use-theory-content-state.ts";

interface AppScreenRendererProps {
  screen: Screen;
  isHomeScreen: boolean;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  theory: TheoryContentState;
  practice: PracticeContentState;
  onExit: VoidHandler;
  onSpeak: SpeakHandler;
}

export default function AppScreenRenderer({
  screen,
  isHomeScreen,
  tab,
  onTabChange,
  theory,
  practice,
  onExit,
  onSpeak
}: AppScreenRendererProps) {
  return (
    <div className={`app ${isHomeScreen ? "" : "app--detail"}`}>
      {isHomeScreen ? (
        <HomeScreen
          tab={tab}
          onOpenAlphabet={theory.openAlphabet}
          onOpenDiphthongs={theory.openDiphthongs}
          onOpenDictionaryTopics={practice.openDictionaryTopics}
          onOpenInputTopics={practice.openInputTopics}
        />
      ) : screen === "alphabet" ? (
        <AlphabetScreen
          alphabetState={theory.alphabetState}
          pageIndex={theory.pageIndex}
          onClose={onExit}
          onPrev={theory.prevAlphabetPage}
          onNext={theory.nextAlphabetPage}
          onRetry={theory.retryAlphabet}
          onSpeak={onSpeak}
        />
      ) : screen === "diphthongs" ? (
        <DiphthongsScreen
          diphthongsState={theory.diphthongsState}
          diphthongIndex={theory.diphthongIndex}
          onClose={onExit}
          onPrev={theory.prevDiphthong}
          onNext={theory.nextDiphthong}
          onRetry={theory.retryDiphthongs}
          onSpeak={onSpeak}
        />
      ) : screen === "practice-input-topics" ? (
        <InputPracticeTopicsScreen onClose={onExit} onOpenTopic={practice.openInputTopic} />
      ) : screen === "practice-input-topic" ? (
        <InputPracticeTopicScreen
          title={practice.selectedInputTopicTitle}
          topicState={practice.selectedInputTopicState}
          onClose={practice.openInputTopics}
          onRetry={practice.retrySelectedInputTopic}
          onSpeak={onSpeak}
        />
      ) : screen === "practice-single-choice-topic" ? (
        <PracticeTopicScreen
          title={practice.selectedSingleChoiceTopic?.title || "Тренировка"}
          topicState={practice.selectedSingleChoiceTopicState}
          onClose={practice.closeSingleChoiceTopic}
          onRetry={practice.retrySingleChoiceTopics}
          onSpeak={onSpeak}
        />
      ) : (
        <SingleChoicePracticeTopicsScreen
          topicsState={practice.singleChoiceTopicListState}
          onClose={onExit}
          onRetry={practice.retrySingleChoiceTopics}
          onOpenTopic={practice.openSingleChoiceTopic}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={onTabChange} /> : null}
    </div>
  );
}
