import type { LinkFact } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import type { SectionTextBase } from "@/shared/contracts/section";

export const CONTACT_IDS = ["email", "whatsapp", "linkedin", "github"] as const;
export type ContactId = (typeof CONTACT_IDS)[number];

export interface ContactFact extends LinkFact<ContactId> {
  /** Text shown as the value: the address, the number or the user name. */
  readonly display: string;
}

export const REFERENCE_IDS = ["jaramillo", "quiroga", "duitama", "hernandez"] as const;
export type ReferenceId = (typeof REFERENCE_IDS)[number];

/** A person who recommends the author (IO-R17). The name and the address are not translated. */
export interface ReferenceFact {
  readonly id: ReferenceId;
  readonly name: string;
  readonly email: `${string}@${string}`;
}

export interface ContactFacts {
  readonly email: string;
  readonly channels: readonly ContactFact[];
  readonly references: readonly ReferenceFact[];
}

export interface ContactText extends SectionTextBase {
  readonly intro: string;
  readonly channelsTitle: string;
  readonly channelLabels: Readonly<Record<ContactId, string>>;
  readonly copyEmailAriaLabel: string;
  readonly cvTitle: string;
  readonly cvLabels: Readonly<Record<Locale, string>>;
  readonly referencesTitle: string;
  readonly referencesIntro: string;
  /** The role of each reference, in one line. */
  readonly referenceRoles: Readonly<Record<ReferenceId, string>>;
}
