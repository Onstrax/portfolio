import type { LinkFact } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import type { SectionTextBase } from "@/shared/contracts/section";

export const CONTACT_IDS = ["email", "whatsapp", "linkedin", "github"] as const;
export type ContactId = (typeof CONTACT_IDS)[number];

export interface ContactFact extends LinkFact<ContactId> {
  /** Text shown as the value: the address, the number or the user name. */
  readonly display: string;
}

export interface ContactFacts {
  readonly email: string;
  readonly channels: readonly ContactFact[];
}

export interface ContactText extends SectionTextBase {
  readonly intro: string;
  readonly channelsTitle: string;
  readonly channelLabels: Readonly<Record<ContactId, string>>;
  readonly copyEmailAriaLabel: string;
  readonly cvTitle: string;
  readonly cvLabels: Readonly<Record<Locale, string>>;
}
