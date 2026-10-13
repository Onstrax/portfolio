"use client";

import type { UiDictionary } from "./dictionaries/en";
import { getUiDictionary } from "./get-ui-dictionary";
import { useLocale } from "./use-locale";

/** Interface dictionary of the current page, for client components (I18N-R13). */
export function useUiDictionary(): UiDictionary {
  return getUiDictionary(useLocale());
}
