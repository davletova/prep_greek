export {};

type TelegramThemeEvent = "themeChanged";
type TelegramColorScheme = "light" | "dark";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        colorScheme?: TelegramColorScheme;
        ready?: () => void;
        onEvent?: (eventType: TelegramThemeEvent, eventHandler: () => void) => void;
        offEvent?: (eventType: TelegramThemeEvent, eventHandler: () => void) => void;
        CloudStorage?: {
          getItem: (
            key: string,
            callback: (error: string | null, value: string | null) => void
          ) => void;
          setItem: (
            key: string,
            value: string,
            callback: (error: string | null, saved: boolean) => void
          ) => void;
          removeItem: (
            key: string,
            callback: (error: string | null, removed: boolean) => void
          ) => void;
        };
      };
    };
  }
}
