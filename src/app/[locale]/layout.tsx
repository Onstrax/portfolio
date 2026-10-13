import "@/styles/globals.css";

import type { Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SITE_THEME } from "@/shared/assets/manifest.generated";
import { isLocale, LOCALES } from "@/shared/contracts/locale";
import { LOCALE_META } from "@/shared/i18n/locales";
import { StoreHydrator } from "@/shared/state/store-hydrator";
import { FONT_VARIABLES } from "@/shared/ui/fonts";

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

export const dynamicParams = false;

export const viewport: Viewport = { themeColor: SITE_THEME.themeColor };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return (
    <html lang={LOCALE_META[locale].htmlLang} className={FONT_VARIABLES}>
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
