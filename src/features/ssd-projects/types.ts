import type {
  LinkFact,
  RepositoryVisibility,
  RichLine,
  TeamSize,
} from "@/shared/contracts/content";
import type { CaseStudyText } from "@/shared/contracts/case-study";
import type { CaseStudyId } from "@/shared/contracts/ids";
import type { SectionTextBase } from "@/shared/contracts/section";

export const PROJECT_IDS = [
  "thesis",
  "andespace",
  "dental-site",
  "habicapital",
  "monitoring-platform",
  "email-blacklist",
  "ahorrapp",
  "dogspa",
  "algorithms",
  "respiratory-etl",
  "sdg-text-classifier",
] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

export const PROJECT_LINK_IDS = [
  "repository",
  "code",
  "flutter",
  "frontend",
  "backend",
  "wiki",
  "landing",
  "live-site",
] as const;
export type ProjectLinkId = (typeof PROJECT_LINK_IDS)[number];

export interface ProjectFact {
  readonly id: ProjectId;
  readonly featured: boolean;
  readonly properName?: string;
  readonly stack: readonly string[];
  readonly teamSize: TeamSize;
  readonly repository: RepositoryVisibility;
  readonly links: readonly LinkFact<ProjectLinkId>[];
}

export interface ProjectsFacts {
  readonly projects: readonly ProjectFact[];
}

export interface ProjectText {
  readonly name?: string;
  readonly tagline: string;
  /** May emphasize one fragment each (TSC-R58). */
  readonly highlights: readonly RichLine[];
  /** Recognition received, if any. */
  readonly award?: string;
  /** Short clarification, if any. */
  readonly note?: string;
}

export interface ProjectsText extends SectionTextBase {
  readonly featuredTitle: string;
  readonly moreTitle: string;
  readonly projects: Readonly<Record<ProjectId, ProjectText>>;
  readonly linkLabels: Readonly<Record<ProjectLinkId, string>>;
  /** Text of the link from a card to its case study (SSD-R07). */
  readonly caseLinkLabel: string;
  /** Content of the case studies (SSD-R11, TSC-R60). */
  readonly cases: Readonly<Record<CaseStudyId, CaseStudyText>>;
}
