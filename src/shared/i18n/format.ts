import type { Month, PartialDate, Period, TeamSize } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";

import { getUiDictionary } from "./get-ui-dictionary";
import { LOCALE_META } from "./locales";

// Month abbreviations are fixed here instead of coming from `Intl`, whose output changes between
// environments (I18N-R17).
const MONTHS: Readonly<Record<Locale, Readonly<Record<Month, string>>>> = {
  es: {
    1: "ene.",
    2: "feb.",
    3: "mar.",
    4: "abr.",
    5: "may.",
    6: "jun.",
    7: "jul.",
    8: "ago.",
    9: "sep.",
    10: "oct.",
    11: "nov.",
    12: "dic.",
  },
  en: {
    1: "Jan.",
    2: "Feb.",
    3: "Mar.",
    4: "Apr.",
    5: "May",
    6: "Jun.",
    7: "Jul.",
    8: "Aug.",
    9: "Sep.",
    10: "Oct.",
    11: "Nov.",
    12: "Dec.",
  },
};

/** Non-breaking space, en dash and a normal space (I18N-R18). */
export const PERIOD_SEPARATOR = " – ";

function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function monthName(month: Month, locale: Locale, capitalize: boolean): string {
  const name = MONTHS[locale][month];
  return capitalize ? capitalizeFirst(name) : name;
}

export function formatPartialDate(
  date: PartialDate,
  locale: Locale,
  options?: { readonly capitalize?: boolean },
): string {
  if (date.month === undefined) return String(date.year);
  return `${monthName(date.month, locale, options?.capitalize === true)} ${String(date.year)}`;
}

export function formatPeriod(period: Period, locale: Locale): string {
  const { start, end } = period;
  const first = formatPartialDate(start, locale, { capitalize: true });
  if (end === "present") {
    return `${first}${PERIOD_SEPARATOR}${getUiDictionary(locale).common.present}`;
  }
  if (start.year === end.year && start.month === end.month) return first;
  const last = formatPartialDate(end, locale);
  if (start.month !== undefined && end.month !== undefined && start.year === end.year) {
    return `${monthName(start.month, locale, true)}${PERIOD_SEPARATOR}${last}`;
  }
  return `${first}${PERIOD_SEPARATOR}${last}`;
}

/** "2024-07" when there is a month; "2024" when there is not. */
export function toIsoDate(date: PartialDate): string {
  if (date.month === undefined) return String(date.year);
  return `${String(date.year)}-${String(date.month).padStart(2, "0")}`;
}

export function formatDecimal(value: number, locale: Locale, fractionDigits: number): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intlTag, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** 1 → `common.individualWorkLabel`; n → `common.teamOfLabel({ count: n })`. */
export function formatTeamSize(size: TeamSize, locale: Locale): string {
  const { common } = getUiDictionary(locale);
  return size === 1 ? common.individualWorkLabel : common.teamOfLabel({ count: size });
}
