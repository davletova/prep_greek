import AppScreenRenderer from "./app/app-screen-renderer.tsx";
import { useHomeNavigation } from "./app/use-home-navigation.ts";
import { usePracticeContentState } from "./app/use-practice-content-state.ts";
import { useScreenNavigation } from "./app/use-screen-navigation.ts";
import { useTelegramWebAppReady } from "./app/use-telegram-web-app-ready.ts";
import { useTheoryContentState } from "./app/use-theory-content-state.ts";
import { speakGreekText } from "./lib/speech.ts";
export default function App() {
  const { screen, setScreen, isHomeScreen, exitToHome: handleExit } =
    useScreenNavigation();
  const { tab, setTab } = useHomeNavigation();
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

  return (
    <AppScreenRenderer
      screen={screen}
      isHomeScreen={isHomeScreen}
      tab={tab}
      onTabChange={setTab}
      alphabetState={alphabetState}
      pageIndex={pageIndex}
      diphthongsState={diphthongsState}
      diphthongIndex={diphthongIndex}
      selectedInputTopicTitle={selectedInputTopicTitle}
      selectedInputTopicState={selectedInputTopicState}
      selectedSingleChoiceTopic={selectedSingleChoiceTopic}
      selectedSingleChoiceTopicState={selectedSingleChoiceTopicState}
      singleChoiceTopicListState={singleChoiceTopicListState}
      onOpenAlphabet={handleOpenAlphabet}
      onOpenDiphthongs={handleOpenDiphthongs}
      onOpenDictionaryTopics={handleOpenDictionaryTopics}
      onOpenWriteWordTopics={handleOpenWriteWordTopics}
      onExit={handleExit}
      onPrevAlphabetPage={handlePrevAlphabetPage}
      onNextAlphabetPage={handleNextAlphabetPage}
      onRetryAlphabet={handleRetryAlphabet}
      onPrevDiphthong={handlePrevDiphthong}
      onNextDiphthong={handleNextDiphthong}
      onRetryDiphthongs={handleRetryDiphthongs}
      onOpenInputTopic={handleOpenInputTopic}
      onRetrySelectedInputTopic={handleRetrySelectedInputTopic}
      onClosePracticeTopic={handleClosePracticeTopic}
      onRetrySingleChoiceTopics={handleRetrySingleChoiceTopics}
      onOpenSingleChoiceTopic={handleOpenSingleChoiceTopic}
      onSpeak={speakGreekText}
    />
  );
}
