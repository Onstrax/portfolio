import type { SectionTextBase } from "@/shared/contracts/section";

export const STACK_GROUP_IDS = [
  "languages",
  "frontend",
  "backend",
  "gcp",
  "aws",
  "devops",
  "data",
  "security",
] as const;
export type StackGroupId = (typeof STACK_GROUP_IDS)[number];

export interface StackGroupFact {
  readonly id: StackGroupId;
  /** Names of technologies: they are not translated. */
  readonly items: readonly string[];
}

export interface StackFacts {
  readonly groups: readonly StackGroupFact[];
}

export interface StackText extends SectionTextBase {
  readonly groups: Readonly<
    Record<StackGroupId, { readonly title: string; readonly note?: string }>
  >;
  readonly methodsTitle: string;
  /** Methodologies and fundamentals: they are translated. */
  readonly methods: readonly string[];
}
