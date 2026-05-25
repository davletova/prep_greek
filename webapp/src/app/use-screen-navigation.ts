import { useState } from "react";
import type { Screen } from "../types/ui.ts";

interface ScreenNavigationState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  isHomeScreen: boolean;
  exitToHome: () => void;
}

export function useScreenNavigation(): ScreenNavigationState {
  const [screen, setScreen] = useState<Screen>("home");
  const isHomeScreen = screen === "home";

  const exitToHome = () => {
    setScreen("home");
  };

  return {
    screen,
    setScreen,
    isHomeScreen,
    exitToHome
  };
}
