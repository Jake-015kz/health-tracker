const STORAGE_PREFIX = "health-tracker";

export const storageKeys = {
  biometrics: `${STORAGE_PREFIX}:biometrics`,
  medications: `${STORAGE_PREFIX}:medications`,
  medicationLogs: `${STORAGE_PREFIX}:medication-logs`,
  telegramConfig: `${STORAGE_PREFIX}:telegram-config`,
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}
