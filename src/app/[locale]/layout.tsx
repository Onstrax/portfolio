import "@/styles/globals.css";

import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { isLocale, LOCALES } from "@/shared/contracts/locale";

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
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
