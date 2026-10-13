import type { LinkFact, Period, RepositoryVisibility } from "@/shared/contracts/content";
import type { SectionTextBase } from "@/shared/contracts/section";

export const SETUP_IDS = ["system", "shell"] as const;
export type SetupId = (typeof SETUP_IDS)[number];

export const BUILT_IDS = ["bongo-cat", "steam-library-hub"] as const;
export type BuiltId = (typeof BUILT_IDS)[number];

export const CONFIGURED_IDS = ["homelab", "sync"] as const;
export type ConfiguredId = (typeof CONFIGURED_IDS)[number];

export interface EcosystemItemFact<Id extends string> {
  readonly id: Id;
  /** Proper names of products and tools: they are not translated. */
  readonly tools: readonly string[];
  readonly repository?: RepositoryVisibility;
  readonly link?: LinkFact;
}

export interface EcosystemFacts {
  readonly setup: readonly EcosystemItemFact<SetupId>[];
  readonly built: readonly EcosystemItemFact<BuiltId>[];
  readonly configured: readonly EcosystemItemFact<ConfiguredId>[];
  readonly leadershipTrainingPeriod: Period;
}

export interface EcosystemItemText {
  readonly name: string;
  readonly description: string;
  readonly linkLabel?: string;
}

export interface EcosystemText extends SectionTextBase {
  readonly intro: string;
  readonly setupTitle: string;
  readonly setup: Readonly<Record<SetupId, EcosystemItemText>>;
  readonly builtTitle: string;
  readonly built: Readonly<Record<BuiltId, EcosystemItemText>>;
  readonly configuredTitle: string;
  readonly configured: Readonly<Record<ConfiguredId, EcosystemItemText>>;
  readonly offlineTitle: string;
  readonly interests: readonly string[];
  readonly leadershipTraining: string;
}
