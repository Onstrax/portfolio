import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { isLocale } from "@/shared/contracts/locale";
import { LOCALE_META } from "@/shared/i18n/locales";
import { FONT_VARIABLES } from "@/shared/ui/fonts";

interface PlainGroupLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

/** Document of the pages that are always the simple view: no pre-paint script, no scene (SYS-R19). */
export default async function PlainGroupLayout({ children, params }: PlainGroupLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return (
    <html lang={LOCALE_META[locale].htmlLang} className={FONT_VARIABLES}>
      <body>{children}</body>
    </html>
  );
}
