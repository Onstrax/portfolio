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

export const AI_TOOL_GROUP_IDS = ["harnesses", "tools", "models"] as const;
export type AiToolGroupId = (typeof AI_TOOL_GROUP_IDS)[number];

export interface StackFacts {
  readonly groups: readonly StackGroupFact[];
  /** AI tools by group (RAM-R10): proper names, they are not translated. */
  readonly aiTools: Readonly<Record<AiToolGroupId, readonly string[]>>;
}

export interface StackText extends SectionTextBase {
  readonly groups: Readonly<
    Record<StackGroupId, { readonly title: string; readonly note?: string }>
  >;
  readonly methodsTitle: string;
  /** Methodologies and fundamentals: they are translated. */
  readonly methods: readonly string[];
  readonly aiTitle: string;
  readonly aiDescription: string;
  readonly aiGroups: Readonly<Record<AiToolGroupId, string>>;
  readonly aboutLinkLabel: string;
}
