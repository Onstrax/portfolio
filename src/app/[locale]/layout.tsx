import "@/styles/globals.css";

import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { isLocale, LOCALES } from "@/shared/contracts/locale";
import { LOCALE_META } from "@/shared/i18n/locales";
import { cn } from "@/shared/lib/cn";
import { StoreHydrator } from "@/shared/state/store-hydrator";

// The two families of the visual system, self-hosted at build time (VIS-R05, SYS-R33).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return (
    <html
      lang={LOCALE_META[locale].htmlLang}
      className={cn(inter.variable, jetBrainsMono.variable)}
    >
      <body>
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
