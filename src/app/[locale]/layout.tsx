import "@/styles/globals.css";

import type { Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SITE_THEME } from "@/shared/assets/manifest.generated";
import { isLocale, LOCALES } from "@/shared/contracts/locale";
import { StoreHydrator } from "@/shared/state/store-hydrator";

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

export const dynamicParams = false;

export const viewport: Viewport = { themeColor: SITE_THEME.themeColor };

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/**
 * Common to every page of a language: styles, base metadata and the stores (TSC-R52). The
 * document itself is rendered by the layout of each group, because only the pages of the scene
 * carry the pre-paint script in their `<head>` (SYS-R13, SYS-R19).
 */
export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return (
    <>
      <StoreHydrator />
      {children}
    </>
  );
}
