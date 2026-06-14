import AppScreenRenderer from "./app/app-screen-renderer.tsx";
import { homeTabForScreen } from "./app/screen-hash-router.ts";
import { useHomeNavigation } from "./app/use-home-navigation.ts";
import { usePracticeContentState } from "./app/use-practice-content-state.ts";
import { useScreenNavigation } from "./app/use-screen-navigation.ts";
import { useTelegramTheme } from "./app/use-telegram-theme.ts";
import { useTelegramWebAppReady } from "./app/use-telegram-web-app-ready.ts";
import { useTheoryContentState } from "./app/use-theory-content-state.ts";
import { speakGreekText } from "./lib/speech.ts";

export default function App() {
  const { screen, setScreen, isHomeScreen, exitToHome: handleExit } = useScreenNavigation();
  const { tab, setTab } = useHomeNavigation();
  const theory = useTheoryContentState(screen, setScreen);
  const practice = usePracticeContentState(screen, setScreen);

  const handleExitWithHomeTab = () => {
    setTab(homeTabForScreen(screen));
    handleExit();
  };

  useTelegramTheme();
  useTelegramWebAppReady();

  return (
    <AppScreenRenderer
      screen={screen}
      isHomeScreen={isHomeScreen}
      tab={tab}
      onTabChange={setTab}
      theory={theory}
      practice={practice}
      onExit={handleExitWithHomeTab}
      onSpeak={speakGreekText}
    />
  );
}
