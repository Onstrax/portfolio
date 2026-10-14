import type { RichLine } from "./content";

/** One decision of the process: which options there were, which one was chosen and why. */
export interface CaseStudyDecision {
  readonly options: string;
  readonly choice: string;
  readonly reason: string;
}

/** Content of a case study in one language (TSC-R60, VSN-R21). */
export interface CaseStudyText {
  /** Short name for the document title and the shared preview: 40 characters at most. */
  readonly title: string;
  /** Description for the metadata: between 50 and 160 characters (QLT-R37). */
  readonly description: string;
  /** The problem and what was at stake, in paragraphs. */
  readonly problem: readonly string[];
  /** Who did the project and how they shared the work, in one sentence. */
  readonly team: string;
  /** What the author did. */
  readonly contributions: readonly string[];
  /** What the rest of the team did. Only when the project is not individual. */
  readonly teamContributions?: string;
  readonly decisions: readonly CaseStudyDecision[];
  /** Changes of direction during the project. */
  readonly changes: readonly string[];
  /** Outcome. May emphasize one fragment per element. */
  readonly outcome: readonly RichLine[];
  /** What the author learned and would do differently. */
  readonly learned: readonly string[];
}
