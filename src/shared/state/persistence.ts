import { isSceneVariant } from "@/shared/contracts/assets";
import { isPrimaryComponentId, type PrimaryComponentId } from "@/shared/contracts/ids";
import { isLocale } from "@/shared/contracts/locale";
import {
  DEFAULT_PREFS,
  DEFAULT_SESSION,
  type PersistedPrefs,
  type PersistedSession,
} from "@/shared/contracts/state";

function parseRecord(raw: string | null): Readonly<Record<string, unknown>> {
  if (raw === null) return {};
  try {
    const value: unknown = JSON.parse(raw);
    return typeof value === "object" && value !== null && !Array.isArray(value) ? { ...value } : {};
  } catch {
    return {};
  }
}

/** Reads the stored preferences. Total: every missing or invalid field takes its default. */
export function parsePrefs(raw: string | null): PersistedPrefs {
  const { soundEnabled, sceneVariant, locale } = parseRecord(raw);
  return {
    soundEnabled: typeof soundEnabled === "boolean" ? soundEnabled : DEFAULT_PREFS.soundEnabled,
    sceneVariant: isSceneVariant(sceneVariant) ? sceneVariant : DEFAULT_PREFS.sceneVariant,
    ...(isLocale(locale) ? { locale } : {}),
  };
}

/** Reads the stored session. Total: every missing or invalid field takes its default. */
export function parseSession(raw: string | null): PersistedSession {
  const { bootSeen, visited, welcomeSeen } = parseRecord(raw);
  const ids: readonly unknown[] = Array.isArray(visited) ? visited : [];
  const unique: PrimaryComponentId[] = [];
  for (const id of ids) {
    if (isPrimaryComponentId(id) && !unique.includes(id)) unique.push(id);
  }
  return {
    bootSeen: typeof bootSeen === "boolean" ? bootSeen : DEFAULT_SESSION.bootSeen,
    visited: unique,
    welcomeSeen: typeof welcomeSeen === "boolean" ? welcomeSeen : DEFAULT_SESSION.welcomeSeen,
  };
}

/** JSON text stored under `STORAGE_KEYS.prefs`: only the persisted fields (TSC-R49). */
export function serializePrefs(prefs: PersistedPrefs): string {
  const { soundEnabled, sceneVariant, locale } = prefs;
  return JSON.stringify({
    soundEnabled,
    sceneVariant,
    ...(locale === undefined ? {} : { locale }),
  });
}

/** JSON text stored under `STORAGE_KEYS.session`: only the persisted fields (TSC-R49). */
export function serializeSession(session: PersistedSession): string {
  const { bootSeen, visited, welcomeSeen } = session;
  return JSON.stringify({ bootSeen, visited, welcomeSeen });
}
