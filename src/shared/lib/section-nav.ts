import { sectionPath } from "@/shared/config/routes";
import { isPrimaryComponentId } from "@/shared/contracts/ids";
import type { Locale } from "@/shared/contracts/locale";
import type { SectionNavItem } from "@/shared/contracts/navigation";
import type { AnySectionDefinition } from "@/shared/contracts/section";

/**
 * Serializable navigation data of the sections, in the order received and in one language.
 * Server layouts build it from the registry and pass it to client components (SYS-R49, SCN-R06).
 */
export function buildSectionNav(
  sections: readonly AnySectionDefinition[],
  locale: Locale,
): readonly SectionNavItem[] {
  return sections.map((section) => ({
    slug: section.slug,
    componentId: section.componentId,
    title: section.text[locale].meta.title,
    hardwareName: section.text[locale].meta.hardwareName,
    href: sectionPath(locale, section.slug),
    isPrimary: isPrimaryComponentId(section.componentId),
  }));
}
