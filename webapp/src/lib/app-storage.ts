interface AsyncKeyValueStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const TELEGRAM_STORAGE_WAIT_TIMEOUT_MS = 8000;
const TELEGRAM_STORAGE_POLL_INTERVAL_MS = 50;

function getTelegramWebApp() {
  return window.Telegram?.WebApp;
}

function getTelegramCloudStorage() {
  return getTelegramWebApp()?.CloudStorage;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function waitForTelegramCloudStorage() {
  const startedAt = Date.now();
  let cloudStorage = getTelegramCloudStorage();

  while (!cloudStorage && Date.now() - startedAt < TELEGRAM_STORAGE_WAIT_TIMEOUT_MS) {
    await delay(TELEGRAM_STORAGE_POLL_INTERVAL_MS);
    cloudStorage = getTelegramCloudStorage();
  }

  return cloudStorage ?? null;
}

const localStorageAdapter: AsyncKeyValueStorage = {
  getItem: async (key) => window.localStorage.getItem(key),
  setItem: async (key, value) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    window.localStorage.removeItem(key);
  },
};

function createTelegramStorage(
  cloudStorage: NonNullable<ReturnType<typeof getTelegramCloudStorage>>
): AsyncKeyValueStorage {
  return {
    getItem: (key) =>
      new Promise((resolve, reject) => {
        cloudStorage.getItem(key, (error, value) => {
          if (error) {
            reject(new Error(error));
            return;
          }

          resolve(value || null);
        });
      }),
    setItem: (key, value) =>
      new Promise((resolve, reject) => {
        cloudStorage.setItem(key, value, (error, saved) => {
          if (error) {
            reject(new Error(error));
            return;
          }

          if (saved === false) {
            reject(new Error("Telegram CloudStorage did not save the value"));
            return;
          }

          resolve();
        });
      }),
    removeItem: (key) =>
      new Promise((resolve, reject) => {
        cloudStorage.removeItem(key, (error, removed) => {
          if (error) {
            reject(new Error(error));
            return;
          }

          if (removed === false) {
            reject(new Error("Telegram CloudStorage did not remove the value"));
            return;
          }

          resolve();
        });
      }),
  };
}

let storagePromise: Promise<AsyncKeyValueStorage> | null = null;

async function resolveStorage(): Promise<AsyncKeyValueStorage> {
  if (!getTelegramWebApp()) {
    return localStorageAdapter;
  }

  // Design decision: inside Telegram we wait for CloudStorage instead of
  // falling back to localStorage. Locking localStorage during Telegram startup
  // can permanently split stats between local and cloud storage in one session.
  // If CloudStorage is still unavailable after the wait, fail this operation;
  // the cached promise is cleared in getStorage(), so later calls can retry and
  // switch to CloudStorage once Telegram finishes initialization.
  const cloudStorage = await waitForTelegramCloudStorage();

  if (!cloudStorage) {
    throw new Error("Telegram CloudStorage is unavailable");
  }

  return createTelegramStorage(cloudStorage);
}

function getStorage(): Promise<AsyncKeyValueStorage> {
  storagePromise ??= resolveStorage().catch((error) => {
    storagePromise = null;
    throw error;
  });

  return storagePromise;
}

export async function getStorageItem(key: string): Promise<string | null> {
  return (await getStorage()).getItem(key);
}

export async function setStorageItem(key: string, value: string): Promise<void> {
  await (await getStorage()).setItem(key, value);
}

export async function removeStorageItem(key: string): Promise<void> {
  await (await getStorage()).removeItem(key);
}
