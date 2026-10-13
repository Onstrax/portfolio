"use client";

import { usePathname, useRouter } from "next/navigation";
import { Fragment, type MouseEvent, useEffect, useRef } from "react";

import { withLocale } from "@/shared/config/routes";
import { type Locale, LOCALES } from "@/shared/contracts/locale";
import { LOCALE_META } from "@/shared/i18n/locales";
import { useLocale } from "@/shared/i18n/use-locale";
import { cn } from "@/shared/lib/cn";
import { usePrefsStore } from "@/shared/state/prefs-store";

import {
  SWITCHER_BASE,
  SWITCHER_CURRENT,
  SWITCHER_LINK,
  SWITCHER_OPTION,
  SWITCHER_SEPARATOR,
} from "./language-switcher.styles";
import type { Surface } from "./link.styles";

interface LanguageSwitcherProps {
  /** Accessible name of the group. */
  readonly label: string;
  /** Identifies this switcher among the ones on the page, to return focus to it (I18N-R27). */
  readonly focusKey: string;
  readonly surface?: Surface;
}

// The locale layout remounts when the language changes, so the switcher that started the change
// leaves a note here for the instance that replaces it.
let pendingFocusKey: string | undefined;

function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * One option per language. The active one is plain text; the others are links to the same view
 * and section in that language, so they work without JavaScript (I18N-R24 to I18N-R27, SET-R06).
 */
export function LanguageSwitcher({ label, focusKey, surface = "dark" }: LanguageSwitcherProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const setLocale = usePrefsStore((state) => state.setLocale);
  const currentOption = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (pendingFocusKey !== focusKey) return;
    pendingFocusKey = undefined;
    currentOption.current?.focus();
  }, [focusKey, locale]);

  const switchTo = (target: Locale) => (event: MouseEvent) => {
    setLocale(target);
    if (!isPlainClick(event)) return;
    event.preventDefault();
    pendingFocusKey = focusKey;
    router.push(`${withLocale(pathname, target)}${window.location.hash}`);
  };

  return (
    <div role="group" aria-label={label} className={SWITCHER_BASE}>
      {LOCALES.map((option, index) => {
        const meta = LOCALE_META[option];
        const text = (
          <>
            <span aria-hidden="true">{meta.shortCode}</span>
            <span className="sr-only">{meta.nativeName}</span>
          </>
        );
        return (
          <Fragment key={option}>
            {index > 0 && (
              <span aria-hidden="true" className={SWITCHER_SEPARATOR[surface]}>
                /
              </span>
            )}
            {option === locale ? (
              <span
                ref={currentOption}
                tabIndex={-1}
                aria-current="true"
                lang={meta.htmlLang}
                className={cn(SWITCHER_OPTION, SWITCHER_CURRENT[surface])}
              >
                {text}
              </span>
            ) : (
              <a
                href={withLocale(pathname, option)}
                hrefLang={meta.htmlLang}
                lang={meta.htmlLang}
                onClick={switchTo(option)}
                className={cn(SWITCHER_OPTION, SWITCHER_LINK[surface])}
              >
                {text}
              </a>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
