import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSection } from "@/features/registry";
import { getPageMetadata } from "@/features/simple-view/server";
import { isSectionSlug, SECTION_SLUGS } from "@/shared/contracts/ids";
import { isLocale } from "@/shared/contracts/locale";

interface SectionPageProps {
  readonly params: Promise<{ readonly locale: string; readonly section: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_SLUGS.map((section) => ({ section }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { locale, section } = await params;
  if (!isLocale(locale) || !isSectionSlug(section)) {
    notFound();
  }
  return getPageMetadata({ view: "section", section }, locale);
}

/**
 * The content of the section, which the scene layer shows inside the detail panel. The same
 * component is already in the base layer, so here its identifiers carry a prefix (PNL-R03).
 */
export default async function SectionPage({ params }: SectionPageProps) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !isSectionSlug(section)) {
    notFound();
  }
  const { Section } = getSection(section);
  return <Section locale={locale} idScope="panel-" />;
}
