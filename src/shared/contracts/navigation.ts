import type { ComponentId, SectionSlug } from "./ids";

/** Serializable data of a section for client components (SYS-R49). */
export interface SectionNavItem {
  readonly slug: SectionSlug;
  readonly componentId: ComponentId;
  /** `meta.title` in the language of the page. */
  readonly title: string;
  /** `meta.hardwareName` in the language of the page. */
  readonly hardwareName: string;
  /** Path of the section in the language of the page. */
  readonly href: string;
  /** `true` for the six primary sections. */
  readonly isPrimary: boolean;
}
