import {
  type CaseStudyId,
  isCaseStudyId,
  isSectionSlug,
  type SectionSlug,
} from "@/shared/contracts/ids";
import { isLocale, type Locale } from "@/shared/contracts/locale";
import type { SiteView } from "@/shared/contracts/navigation";

export type HomePath = `/${Locale}/`;
export type SectionPath = `/${Locale}/${SectionSlug}/`;
export type CvPath = `/${Locale}/cv/`;
export type CaseStudyPath = `/${Locale}/projects/${CaseStudyId}/`;
export type AppPath = HomePath | SectionPath | CvPath | CaseStudyPath;

/** Segment reserved for the simple view; it is never a `SectionSlug` (SYS-R10). */
export const CV_SEGMENT = "cv";

export type ParsedPath =
  | { readonly view: "home"; readonly locale: Locale }
  | { readonly view: "section"; readonly locale: Locale; readonly section: SectionSlug }
  | { readonly view: "cv"; readonly locale: Locale }
  | { readonly view: "case"; readonly locale: Locale; readonly caseStudy: CaseStudyId };

export function homePath(locale: Locale): HomePath {
  return `/${locale}/`;
}

export function sectionPath(locale: Locale, section: SectionSlug): SectionPath {
  return `/${locale}/${section}/`;
}

export function cvPath(locale: Locale): CvPath {
  return `/${locale}/${CV_SEGMENT}/`;
}

/** Page of the case study of a project, under the projects section (SYS §4.3). */
export function caseStudyPath(locale: Locale, caseStudy: CaseStudyId): CaseStudyPath {
  return `/${locale}/projects/${caseStudy}/`;
}

/** Query with which a case study page knows that it was opened from the simple view (SMP-R30). */
export const VIEW_QUERY = "view=simple";

/**
 * Link from a section to another one, or to an element of it, without leaving the view
 * (TSC-R61): in the scene, the path of the section, which opens its panel; in the simple view,
 * only the fragment, which jumps within the same page.
 */
export function crossSectionHref(
  locale: Locale,
  view: SiteView,
  section: SectionSlug,
  localId?: string,
): string {
  if (view === "simple") return `#${localId ?? section}`;
  return localId === undefined
    ? sectionPath(locale, section)
    : `${sectionPath(locale, section)}#${localId}`;
}

/** Link to a case study that remembers the view it was opened from (TSC-R61, SMP-R30). */
export function caseStudyHref(locale: Locale, caseStudy: CaseStudyId, view: SiteView): string {
  const path = caseStudyPath(locale, caseStudy);
  return view === "simple" ? `${path}?${VIEW_QUERY}` : path;
}

/** Reads a pathname, with or without trailing slash. `null` when it is none of the four views. */
export function parsePath(pathname: string): ParsedPath | null {
  if (!pathname.startsWith("/")) return null;
  const trimmed = pathname.endsWith("/") ? pathname.slice(1, -1) : pathname.slice(1);
  const [locale, segment, ...rest] = trimmed.split("/");
  if (!isLocale(locale)) return null;
  if (rest.length > 0) {
    // Only a case study lives one level deeper, and only under the projects section (TSC-R56).
    const [caseStudy, ...extra] = rest;
    if (segment !== "projects" || extra.length > 0 || !isCaseStudyId(caseStudy)) return null;
    return { view: "case", locale, caseStudy };
  }
  if (segment === undefined) return { view: "home", locale };
  if (segment === CV_SEGMENT) return { view: "cv", locale };
  if (isSectionSlug(segment)) return { view: "section", locale, section: segment };
  return null;
}

export function toPath(parsed: ParsedPath): AppPath {
  switch (parsed.view) {
    case "home":
      return homePath(parsed.locale);
    case "section":
      return sectionPath(parsed.locale, parsed.section);
    case "cv":
      return cvPath(parsed.locale);
    case "case":
      return caseStudyPath(parsed.locale, parsed.caseStudy);
  }
}

/** Same view and section in another language. An unknown path leads to the home of that language. */
export function withLocale(pathname: string, target: Locale): AppPath {
  const parsed = parsePath(pathname);
  if (parsed === null) return homePath(target);
  return toPath({ ...parsed, locale: target });
}
