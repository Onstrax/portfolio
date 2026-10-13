import "@/styles/globals.css";

import type { Metadata } from "next";

import { homePath } from "@/shared/config/routes";
import { FALLBACK_LOCALE, type Locale, LOCALES } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { LOCALE_META } from "@/shared/i18n/locales";
import { buildLanguageRedirectScript } from "@/shared/lib/language-redirect-script";
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

export const metadata: Metadata = {
  title: fallback.languageGate.title,
  robots: { index: false },
};

/**
 * `/`: sends the visitor to the home of a language (SYS-R08). Without JavaScript it shows one
 * link per language. It belongs to no language, so it renders its own `<html>` (SYS-R22).
 */
export default function LanguageGatePage() {
  return (
    <html lang={LOCALE_META[FALLBACK_LOCALE].htmlLang} className={FONT_VARIABLES}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: buildLanguageRedirectScript() }} />
        <SkipLink label={fallback.common.skipToContentLabel} targetId={CONTENT_ID} />
        <main
          id={CONTENT_ID}
          tabIndex={-1}
          className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col justify-center gap-6 px-4 py-8 focus:outline-none sm:px-6"
        >
          <h1 className="font-mono text-3xl leading-9 font-semibold">
            {fallback.languageGate.title}
          </h1>
          <ul className="flex flex-wrap gap-3">
            {ORDERED_LOCALES.map((locale, index) => (
              <li key={locale} lang={LOCALE_META[locale].htmlLang}>
                <ButtonLink href={homePath(locale)} variant={index === 0 ? "primary" : "secondary"}>
                  {getUiDictionary(locale).languageGate.continueLabel}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </main>
      </body>
    </html>
  );
}
