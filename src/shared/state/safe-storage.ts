// The only module that touches browser storage (TSC-R53). Every access is guarded: if storage is
// missing or throws, reads return `null` and writes do nothing (SYS-R27).

export type StorageArea = "local" | "session";

function storageOf(area: StorageArea): Storage | null {
  if (typeof window === "undefined") return null;
  return area === "local" ? window.localStorage : window.sessionStorage;
}

export function readStorage(area: StorageArea, key: string): string | null {
  try {
    return storageOf(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeStorage(area: StorageArea, key: string, value: string): void {
  try {
    storageOf(area)?.setItem(key, value);
  } catch {
    // Storage is unavailable or full: the application keeps working in memory.
  }
}
