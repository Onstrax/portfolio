import type { Period, RepositoryVisibility, TeamSize } from "@/shared/contracts/content";
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
}

export interface ExperienceFacts {
  readonly jobs: readonly JobFact[];
  readonly leadershipPeriod: Period;
}

export interface JobText {
  readonly role: string;
  readonly highlights: readonly string[];
}

export interface ExperienceText extends SectionTextBase {
  readonly jobsTitle: string;
  readonly jobs: Readonly<Record<JobId, JobText>>;
  readonly dentalSiteLinkLabel: string;
  readonly skillsTitle: string;
  readonly skills: readonly string[];
  readonly leadershipTitle: string;
  readonly leadership: string;
}
