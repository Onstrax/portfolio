/** The six primary components, in canonical order (VSN §4.1). */
export const PRIMARY_COMPONENT_IDS = ["cpu", "psu", "ssd", "ram", "io", "fan"] as const;
export type PrimaryComponentId = (typeof PRIMARY_COMPONENT_IDS)[number];

/** The seven elements that open a section, in canonical order (VSN §4). */
export const COMPONENT_IDS = [...PRIMARY_COMPONENT_IDS, "cmos"] as const;
export type ComponentId = (typeof COMPONENT_IDS)[number];

/** The nine scene objects that have a calibrated hotspot (AST §4.4). */
export const SCENE_OBJECT_IDS = [...COMPONENT_IDS, "settings", "post-display"] as const;
export type SceneObjectId = (typeof SCENE_OBJECT_IDS)[number];

/** Section opened by each component (VSN §4). The only definition of this mapping. */
export const SECTION_BY_COMPONENT = {
  cpu: "profile",
  psu: "experience",
  ssd: "projects",
  ram: "stack",
  io: "contact",
  fan: "ecosystem",
  cmos: "about",
} as const satisfies Record<ComponentId, string>;

export type SectionSlugOf<C extends ComponentId> = (typeof SECTION_BY_COMPONENT)[C];
export type SectionSlug = SectionSlugOf<ComponentId>;
export type PrimarySectionSlug = SectionSlugOf<PrimaryComponentId>;

/** Component that opens a given section. */
export type ComponentOf<S extends SectionSlug> = {
  [C in ComponentId]: SectionSlugOf<C> extends S ? C : never;
}[ComponentId];

/** The seven slugs, in canonical order. */
export const SECTION_SLUGS: readonly SectionSlug[] = COMPONENT_IDS.map(
  (id) => SECTION_BY_COMPONENT[id],
);

/** The six primary slugs, in canonical order. */
export const PRIMARY_SECTION_SLUGS: readonly PrimarySectionSlug[] = PRIMARY_COMPONENT_IDS.map(
  (id) => SECTION_BY_COMPONENT[id],
);

export function isComponentId(value: unknown): value is ComponentId {
  return COMPONENT_IDS.some((id) => id === value);
}

export function isPrimaryComponentId(value: unknown): value is PrimaryComponentId {
  return PRIMARY_COMPONENT_IDS.some((id) => id === value);
}

export function isSectionSlug(value: unknown): value is SectionSlug {
  return SECTION_SLUGS.some((slug) => slug === value);
}

export function componentOfSection(slug: SectionSlug): ComponentId {
  const match = COMPONENT_IDS.find((id) => SECTION_BY_COMPONENT[id] === slug);
  if (match === undefined) {
    throw new Error(`No component opens section "${slug}"`);
  }
  return match;
}

/**
 * Projects with a case study, in the order they are listed (VSN-R21, D-82). Each one is a
 * `ProjectId` of the projects section; a type test checks it (TSC-AC19).
 */
export const CASE_STUDY_IDS = ["thesis", "andespace", "dental-site"] as const;
export type CaseStudyId = (typeof CASE_STUDY_IDS)[number];

export function isCaseStudyId(value: unknown): value is CaseStudyId {
  return CASE_STUDY_IDS.some((id) => id === value);
}
