import type { Period } from "@/shared/contracts/content";
import type { SectionTextBase } from "@/shared/contracts/section";

export const EDUCATION_IDS = ["uniandes", "hm"] as const;
export type EducationId = (typeof EDUCATION_IDS)[number];

export const LANGUAGE_IDS = ["es", "en", "de"] as const;
export type LanguageId = (typeof LANGUAGE_IDS)[number];

export interface EducationFact {
  readonly id: EducationId;
  readonly institution: string;
  readonly period: Period;
}

export interface ProfileFacts {
  readonly name: string;
  readonly location: string;
  readonly city: string;
  readonly countryCode: string;
  readonly education: readonly EducationFact[];
  readonly gpa: { readonly value: number; readonly scale: number };
  readonly graduationYear: number;
  readonly exchangeCredits: string;
  readonly languages: readonly LanguageId[];
}

export interface ProfileText extends SectionTextBase {
  readonly degree: string;
  readonly focusAreas: readonly string[];
  readonly availability: string;
  readonly summaryTitle: string;
  readonly summary: readonly string[];
  readonly educationTitle: string;
  readonly education: Readonly<
    Record<EducationId, { readonly program: string; readonly detail: string }>
  >;
  readonly gpaLabel: string;
  readonly graduationLabel: string;
  readonly coursesLabel: string;
  readonly courses: readonly string[];
  readonly additionalTraining: string;
  readonly languagesTitle: string;
  readonly languages: Readonly<
    Record<LanguageId, { readonly name: string; readonly level: string }>
  >;
  readonly recognitionTitle: string;
  readonly hallOfFame: string;
  readonly projectAwards: string;
  readonly projectAwardsLinkLabel: string;
}
