import TabBar from "../components/tab-bar.tsx";
import AlphabetScreen from "../screens/alphabet-screen.tsx";
import DiphthongsScreen from "../screens/diphthongs-screen.tsx";
import HomeScreen from "../screens/home-screen.tsx";
import InputPracticeTopicScreen from "../screens/input-practice-topic-screen.tsx";
import PracticeTopicScreen from "../screens/practice-topic-screen.tsx";
import PracticeTopicsScreen from "../screens/practice-topics-screen.tsx";
import WriteWordTopicsScreen from "../screens/write-word-topics-screen.tsx";
import type { SingleChoiceTopic } from "../services/content/practice-content-service.ts";
import type { AlphabetContent, DiphthongsContent } from "../types/content.ts";
import type { ExerciseCollection, InputExercise } from "../types/exercises.ts";
import type { TopicListItem } from "../types/topic-list.ts";
import type { LoadableState, Screen, SpeakHandler, TabKey, VoidHandler } from "../types/ui.ts";

interface AppScreenRendererProps {
  screen: Screen;
  isHomeScreen: boolean;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  alphabetState: LoadableState<AlphabetContent>;
  pageIndex: number;
  diphthongsState: LoadableState<DiphthongsContent>;
  diphthongIndex: number;
  selectedInputTopicTitle: string;
  selectedInputTopicState: LoadableState<InputExercise[]>;
  selectedSingleChoiceTopic: SingleChoiceTopic | undefined;
  selectedSingleChoiceTopicState: LoadableState<ExerciseCollection>;
  singleChoiceTopicListState: LoadableState<TopicListItem[]>;
  onOpenAlphabet: VoidHandler;
  onOpenDiphthongs: VoidHandler;
  onOpenDictionaryTopics: VoidHandler;
  onOpenWriteWordTopics: VoidHandler;
  onExit: VoidHandler;
  onPrevAlphabetPage: VoidHandler;
  onNextAlphabetPage: VoidHandler;
  onRetryAlphabet: VoidHandler;
  onPrevDiphthong: VoidHandler;
  onNextDiphthong: (max: number) => void;
  onRetryDiphthongs: VoidHandler;
  onOpenInputTopic: (topicId: string) => void;
  onRetrySelectedInputTopic: VoidHandler;
  onClosePracticeTopic: VoidHandler;
  onRetrySingleChoiceTopics: VoidHandler;
  onOpenSingleChoiceTopic: (topicId: string) => void;
  onSpeak: SpeakHandler;
}

export default function AppScreenRenderer({
  screen,
  isHomeScreen,
  tab,
  onTabChange,
  alphabetState,
  pageIndex,
  diphthongsState,
  diphthongIndex,
  selectedInputTopicTitle,
  selectedInputTopicState,
  selectedSingleChoiceTopic,
  selectedSingleChoiceTopicState,
  singleChoiceTopicListState,
  onOpenAlphabet,
  onOpenDiphthongs,
  onOpenDictionaryTopics,
  onOpenWriteWordTopics,
  onExit,
  onPrevAlphabetPage,
  onNextAlphabetPage,
  onRetryAlphabet,
  onPrevDiphthong,
  onNextDiphthong,
  onRetryDiphthongs,
  onOpenInputTopic,
  onRetrySelectedInputTopic,
  onClosePracticeTopic,
  onRetrySingleChoiceTopics,
  onOpenSingleChoiceTopic,
  onSpeak
}: AppScreenRendererProps) {
  return (
    <div className={`app ${isHomeScreen ? "" : "app--detail"}`}>
      {isHomeScreen ? (
        <HomeScreen
          tab={tab}
          onOpenAlphabet={onOpenAlphabet}
          onOpenDiphthongs={onOpenDiphthongs}
          onOpenDictionaryTopics={onOpenDictionaryTopics}
          onOpenWriteWordTopics={onOpenWriteWordTopics}
        />
      ) : screen === "alphabet" ? (
        <AlphabetScreen
          alphabetState={alphabetState}
          pageIndex={pageIndex}
          onClose={onExit}
          onPrev={onPrevAlphabetPage}
          onNext={onNextAlphabetPage}
          onRetry={onRetryAlphabet}
          onSpeak={onSpeak}
        />
      ) : screen === "diphthongs" ? (
        <DiphthongsScreen
          diphthongsState={diphthongsState}
          diphthongIndex={diphthongIndex}
          onClose={onExit}
          onPrev={onPrevDiphthong}
          onNext={onNextDiphthong}
          onRetry={onRetryDiphthongs}
          onSpeak={onSpeak}
        />
      ) : screen === "practice-write-word-topics" ? (
        <WriteWordTopicsScreen onClose={onExit} onOpenTopic={onOpenInputTopic} />
      ) : screen === "practice-input-topic" ? (
        <InputPracticeTopicScreen
          title={selectedInputTopicTitle}
          topicState={selectedInputTopicState}
          onClose={onOpenWriteWordTopics}
          onRetry={onRetrySelectedInputTopic}
          onSpeak={onSpeak}
        />
      ) : screen === "practice-single-choice-topic" ? (
        <PracticeTopicScreen
          title={selectedSingleChoiceTopic?.title || "Тренировка"}
          topicState={selectedSingleChoiceTopicState}
          onClose={onClosePracticeTopic}
          onRetry={onRetrySingleChoiceTopics}
          onSpeak={onSpeak}
        />
      ) : (
        <PracticeTopicsScreen
          topicsState={singleChoiceTopicListState}
          onClose={onExit}
          onRetry={onRetrySingleChoiceTopics}
          onOpenTopic={onOpenSingleChoiceTopic}
        />
      )}

      {isHomeScreen ? <TabBar tab={tab} onChange={onTabChange} /> : null}
    </div>
  );
}
