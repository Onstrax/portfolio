import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudyPage, getPageMetadata } from "@/features/simple-view/server";
import { CASE_STUDY_IDS, isCaseStudyId } from "@/shared/contracts/ids";
import { isLocale } from "@/shared/contracts/locale";

interface CaseStudyRouteProps {
  readonly params: Promise<{ readonly locale: string; readonly caseStudy: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDY_IDS.map((caseStudy) => ({ caseStudy }));
}

export async function generateMetadata({ params }: CaseStudyRouteProps): Promise<Metadata> {
  const { locale, caseStudy } = await params;
  if (!isLocale(locale) || !isCaseStudyId(caseStudy)) {
    notFound();
  }
  return getPageMetadata({ view: "case", caseStudy }, locale);
}

/** The case study of a project, always as a plain page (SYS §4.3, SMP-R26). */
export default async function CaseStudyRoute({ params }: CaseStudyRouteProps) {
  const { locale, caseStudy } = await params;
  if (!isLocale(locale) || !isCaseStudyId(caseStudy)) {
    notFound();
  }
  return <CaseStudyPage locale={locale} caseStudy={caseStudy} />;
}
