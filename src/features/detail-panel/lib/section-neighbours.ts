import type { SectionSlug } from "@/shared/contracts/ids";
import type { SectionNavItem } from "@/shared/contracts/navigation";

export interface SectionNeighbours {
  readonly current: SectionNavItem;
  readonly previous: SectionNavItem;
  readonly next: SectionNavItem;
  /** Place of the current section in the list, counting from 1. */
  readonly position: number;
  readonly total: number;
}

/**
 * The section before and the one after `slug`, in the order of the list and going around its
 * ends (PNL-R15), with the position that the footer shows (PNL-R17). `null` when the list does
 * not contain the section.
 */
export function findNeighbours(
  sections: readonly SectionNavItem[],
  slug: SectionSlug,
): SectionNeighbours | null {
  const index = sections.findIndex((section) => section.slug === slug);
  const current = sections[index];
  const previous = sections[(index - 1 + sections.length) % sections.length];
  const next = sections[(index + 1) % sections.length];
  if (current === undefined || previous === undefined || next === undefined) return null;
  return { current, previous, next, position: index + 1, total: sections.length };
}
