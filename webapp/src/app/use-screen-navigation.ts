import { useState } from "react";
import { screenFromHash } from "./screen-hash-router.ts";
import type { Screen } from "../types/ui.ts";

interface ScreenNavigationState {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  isHomeScreen: boolean;
  exitToHome: () => void;
}

function getInitialScreen(): Screen {
  if (typeof window === "undefined") {
    return "home";
  }

  return screenFromHash(window.location.hash);
}

export function useScreenNavigation(): ScreenNavigationState {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);
  const isHomeScreen = screen === "home";

  const exitToHome = () => {
    setScreen("home");
  };

  return {
    screen,
    setScreen,
    isHomeScreen,
    exitToHome,
  };
}
