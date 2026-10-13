import type { Period } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import { formatPeriod, PERIOD_SEPARATOR, toIsoDate } from "@/shared/i18n/format";

interface PeriodTextProps {
  readonly period: Period;
  readonly locale: Locale;
}

/**
 * A period as text, with every date inside a `<time>` element whose `dateTime` is machine
 * readable (I18N-R21). Sections use it instead of calling `formatPeriod` themselves.
 */
export function PeriodText({ period, locale }: PeriodTextProps) {
  const [first = "", last] = formatPeriod(period, locale).split(PERIOD_SEPARATOR);
  const start = <time dateTime={toIsoDate(period.start)}>{first}</time>;
  if (last === undefined) return start;

  return (
    <span>
      {start}
      {PERIOD_SEPARATOR}
      {period.end === "present" ? last : <time dateTime={toIsoDate(period.end)}>{last}</time>}
    </span>
  );
}
