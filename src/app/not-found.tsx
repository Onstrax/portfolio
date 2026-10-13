import "@/styles/globals.css";

import type { Metadata } from "next";

import { homePath } from "@/shared/config/routes";
import { FALLBACK_LOCALE, type Locale, LOCALES } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { LOCALE_META } from "@/shared/i18n/locales";
import { ButtonLink } from "@/shared/ui/button-link";
import { FONT_VARIABLES } from "@/shared/ui/fonts";
import { SkipLink } from "@/shared/ui/skip-link";

const CONTENT_ID = "content";
const fallback = getUiDictionary(FALLBACK_LOCALE);
/** The fallback language goes first (I18N §4.3.2). */
const ORDERED_LOCALES: readonly Locale[] = [
  FALLBACK_LOCALE,
  ...LOCALES.filter((locale) => locale !== FALLBACK_LOCALE),
];
const TITLE_CLASSES = "font-mono text-3xl leading-9 font-semibold";

export const metadata: Metadata = {
  title: fallback.notFound.title,
  robots: { index: false },
};

/**
 * 404: says so in every language and offers the way back to the portfolio (QLT-R45). It belongs
 * to no language, so it renders its own `<html>` (SYS-R22).
 */
export default function NotFoundPage() {
  return (
    <html lang={LOCALE_META[FALLBACK_LOCALE].htmlLang} className={FONT_VARIABLES}>
      <body>
        <SkipLink label={fallback.common.skipToContentLabel} targetId={CONTENT_ID} />
        <main
          id={CONTENT_ID}
          tabIndex={-1}
          className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col justify-center gap-10 px-4 py-8 focus:outline-none sm:px-6"
        >
          {ORDERED_LOCALES.map((locale, index) => {
            const { notFound } = getUiDictionary(locale);
            return (
              <div key={locale} lang={LOCALE_META[locale].htmlLang} className="space-y-4">
                {index === 0 ? (
                  <h1 className={TITLE_CLASSES}>{notFound.title}</h1>
                ) : (
                  <h2 className={TITLE_CLASSES}>{notFound.title}</h2>
                )}
                <p>{notFound.description}</p>
                <ButtonLink href={homePath(locale)} variant={index === 0 ? "primary" : "secondary"}>
                  {notFound.homeLabel}
                </ButtonLink>
              </div>
            );
          })}
        </main>
      </body>
    </html>
  );
}
