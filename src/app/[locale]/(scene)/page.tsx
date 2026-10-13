import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPageMetadata } from "@/features/simple-view/server";
import { isLocale } from "@/shared/contracts/locale";

interface HomePageProps {
  readonly params: Promise<{ readonly locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return getPageMetadata({ view: "home" }, locale);
}

/** Home: there is no open section, so the page itself renders nothing (SYS §4.5). */
export default function HomePage() {
  return null;
}
