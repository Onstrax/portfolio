import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPageMetadata, SimpleView } from "@/features/simple-view/server";
import { isLocale } from "@/shared/contracts/locale";

interface CvPageProps {
  readonly params: Promise<{ readonly locale: string }>;
}

export async function generateMetadata({ params }: CvPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return getPageMetadata({ view: "cv" }, locale);
}

/** The simple view, always, whatever the viewport (SYS §4.3). */
export default async function CvPage({ params }: CvPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return <SimpleView locale={locale} variant="standalone" />;
}
