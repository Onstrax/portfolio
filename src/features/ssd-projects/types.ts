import type { LinkFact, RepositoryVisibility, TeamSize } from "@/shared/contracts/content";
import type { SectionTextBase } from "@/shared/contracts/section";

export const PROJECT_IDS = [
  "thesis",
  "andespace",
  "habicapital",
  "dental-site",
  "monitoring-platform",
  "email-blacklist",
  "ahorrapp",
  "dogspa",
  "algorithms",
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
  readonly highlights: readonly string[];
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
}
