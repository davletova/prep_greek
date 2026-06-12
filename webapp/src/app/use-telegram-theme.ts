import { useEffect } from "react";

const SUPPORTED_COLOR_SCHEMES = new Set(["light", "dark"]);

function applyTelegramTheme(): void {
  const colorScheme = window.Telegram?.WebApp?.colorScheme;

  if (colorScheme && SUPPORTED_COLOR_SCHEMES.has(colorScheme)) {
    document.documentElement.dataset.theme = colorScheme;
    return;
  }

  delete document.documentElement.dataset.theme;
}

export function useTelegramTheme(): void {
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;

    if (!webApp) {
      delete document.documentElement.dataset.theme;
      return;
    }

    applyTelegramTheme();

    webApp.onEvent?.("themeChanged", applyTelegramTheme);

    return () => {
      webApp.offEvent?.("themeChanged", applyTelegramTheme);
    };
  }, []);
}
