import type {
  LinkFact,
  Period,
  RepositoryVisibility,
  RichLine,
  TeamSize,
} from "@/shared/contracts/content";
import type { SectionTextBase } from "@/shared/contracts/section";

export const JOB_IDS = ["teaching-assistant", "freelance", "tutor"] as const;
export type JobId = (typeof JOB_IDS)[number];

export interface JobFact {
  readonly id: JobId;
  readonly period: Period;
  /** Institution, when the work was done for one. */
  readonly organization?: string;
  readonly teamSize: TeamSize;
  /** Technologies, shown as chips. May be empty. */
  readonly stack: readonly string[];
  /** Visibility of the related repository, if there is one. */
  readonly repository?: RepositoryVisibility;
  /** Link to the repository, when it is public (PSU-R07). */
  readonly repositoryLink?: LinkFact<"repository">;
}

export interface ExperienceFacts {
  readonly jobs: readonly JobFact[];
  readonly leadershipPeriod: Period;
}

export interface JobText {
  readonly role: string;
  /** May emphasize one fragment each (TSC-R58). */
  readonly highlights: readonly RichLine[];
}

export interface ExperienceText extends SectionTextBase {
  readonly jobsTitle: string;
  readonly jobs: Readonly<Record<JobId, JobText>>;
  readonly dentalSiteLinkLabel: string;
  readonly automationLinkLabel: string;
  readonly skillsTitle: string;
  readonly skills: readonly string[];
  readonly leadershipTitle: string;
  readonly leadership: string;
}
