import { useEffect, useState } from "react";
import { screenFromHash, screenToHash } from "./screen-hash-router.ts";
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
  const [screen, setScreenState] = useState<Screen>(getInitialScreen);
  const isHomeScreen = screen === "home";

  const setScreen = (nextScreen: Screen) => {
    if (typeof window !== "undefined") {
      window.location.hash = screenToHash(nextScreen);
    }

    setScreenState(nextScreen);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setScreenState(screenFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

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
