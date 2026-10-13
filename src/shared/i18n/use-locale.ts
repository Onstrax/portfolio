"use client";

import { useParams } from "next/navigation";

import { FALLBACK_LOCALE, isLocale, type Locale } from "@/shared/contracts/locale";

/** Language of the current page, read from the `[locale]` segment of the route (I18N-R13). */
export function useLocale(): Locale {
  const params = useParams<{ locale?: string }>();
  return isLocale(params.locale) ? params.locale : FALLBACK_LOCALE;
}
