import { sectionPath } from "@/shared/config/routes";
import type { LinkFact, SitePath } from "@/shared/contracts/content";
import { isPrimaryComponentId } from "@/shared/contracts/ids";
import type { Locale } from "@/shared/contracts/locale";
import {
  QUICK_CONTACT_IDS,
  type QuickContact,
  type SceneIdentity,
  type SectionNavItem,
} from "@/shared/contracts/navigation";
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

/**
 * Data of the identity plate of the scene (SCN-R52). The `(scene)` layout builds it from the
 * author name and the profile texts of the language of the page.
 */
export function buildSceneIdentity(
  name: string,
  profile: { readonly degree: string; readonly focusAreas: readonly string[] },
): SceneIdentity {
  return { name, degree: profile.degree, focusAreas: profile.focusAreas };
}

/**
 * Direct contacts of the fixed bar (SET-R31): the résumé, then the mail, LinkedIn and GitHub
 * channels of the contact section. Throws when a channel is missing, so the build fails before
 * an incomplete bar is published.
 */
export function buildQuickContacts(
  channels: readonly LinkFact[],
  cv: SitePath,
): readonly QuickContact[] {
  return QUICK_CONTACT_IDS.map((id) => {
    if (id === "cv") return { id, href: cv };
    const channel = channels.find((item) => item.id === id);
    if (channel === undefined) throw new Error(`The contact channel "${id}" is missing`);
    return { id, href: channel.href };
  });
}
