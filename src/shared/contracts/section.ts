import type { ReactNode } from "react";
import type { SiteView } from "./navigation";

import type { ComponentId, SectionSlugOf } from "./ids";
import type { Locale } from "./locale";

export interface SectionMeta {
  /** Name of the section, as listed in VSN §4. */
  readonly title: string;
  /** Name of the hardware piece, as listed in VSN §4. */
  readonly hardwareName: string;
  /** One sentence that sums up the section. Used in metadata and as accessible description. */
  readonly description: string;
}

/** Every section text object extends this type. */
export interface SectionTextBase {
  readonly meta: SectionMeta;
}

/** Line that a section contributes to the boot log. Always in English (D-10). */
export interface BootLine {
  readonly message: string;
  readonly status: "ok" | "none";
}

export interface SectionProps {
  readonly locale: Locale;
  /** Prefix that the component prepends to every `id` attribute it renders. */
  readonly idScope: string;
  /** View in which the section is shown: it decides where its internal links lead (TSC-R61). */
  readonly view: SiteView;
}

export interface SectionDefinition<C extends ComponentId, F, T extends SectionTextBase> {
  readonly componentId: C;
  readonly slug: SectionSlugOf<C>;
  /** Data that does not depend on the language. */
  readonly facts: F;
  /** Texts per language. */
  readonly text: Readonly<Record<Locale, T>>;
  readonly bootLines: readonly BootLine[];
  /** Root component of the section. */
  readonly Section: (props: SectionProps) => ReactNode;
}

/** Definition with its concrete types erased, to iterate over all sections. */
export type AnySectionDefinition = SectionDefinition<ComponentId, unknown, SectionTextBase>;
