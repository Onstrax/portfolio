import type { Href } from "./content";
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

/** Data of the identity plate of the scene, resolved for the language of the page (SCN-R46). */
export interface SceneIdentity {
  readonly name: string;
  readonly degree: string;
  readonly focusAreas: readonly string[];
}

export const QUICK_CONTACT_IDS = ["cv", "email", "linkedin", "github"] as const;
export type QuickContactId = (typeof QUICK_CONTACT_IDS)[number];

/** A direct contact of the fixed bar (SET-R30), with its address already resolved. */
export interface QuickContact {
  readonly id: QuickContactId;
  readonly href: Href;
}
