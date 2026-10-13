import type { LinkFact } from "@/shared/contracts/content";
import type { SectionTextBase } from "@/shared/contracts/section";

export interface AboutFacts {
  /** Technologies the site is built with. */
  readonly stack: readonly string[];
  readonly repository: LinkFact<"repository">;
}

export interface AboutText extends SectionTextBase {
  readonly intro: string;
  readonly methodTitle: string;
  readonly method: readonly string[];
  readonly stackTitle: string;
  readonly qualityTitle: string;
  readonly quality: readonly string[];
  readonly imageTitle: string;
  readonly image: string;
  readonly repositoryLabel: string;
}
