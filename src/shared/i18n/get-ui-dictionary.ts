import type { Locale } from "@/shared/contracts/locale";

import { en, type UiDictionary } from "./dictionaries/en";
import { es } from "./dictionaries/es";

const DICTIONARIES: Readonly<Record<Locale, UiDictionary>> = { es, en };

/** Interface dictionary of a language. For server components and pure functions (I18N-R13). */
export function getUiDictionary(locale: Locale): UiDictionary {
  return DICTIONARIES[locale];
}
