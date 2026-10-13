import { SECTIONS } from "@/features/registry";
import { PORTRAIT_ASSET } from "@/shared/assets/manifest.generated";
import { SITE } from "@/shared/config/site";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";

import { absoluteUrl, pagePath } from "./page-urls";

/** Channels of the contact section that identify the author elsewhere on the web. */
const PROFILE_CHANNELS: readonly string[] = ["linkedin", "github"];

/**
 * schema.org `Person` that describes the author. Every value comes from the site configuration
 * and from the profile and contact sections: nothing is written by hand here (SMP-R18).
 */
export function buildPersonJsonLd(locale: Locale): Readonly<Record<string, unknown>> {
  const profile = SECTIONS.profile.facts;
  const contact = SECTIONS.contact.facts;
  const [university] = profile.education;
  // The derivatives are listed from the smallest to the largest.
  const [, , largestPortrait] = PORTRAIT_ASSET.sources.jpeg;

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.authorName,
    url: absoluteUrl(pagePath({ view: "home" }, locale)),
    image: absoluteUrl(largestPortrait.src),
    description: getUiDictionary(locale).site.description,
    email: contact.email,
    sameAs: contact.channels
      .filter((channel) => PROFILE_CHANNELS.includes(channel.id))
      .map((channel) => channel.href),
    alumniOf: { "@type": "CollegeOrUniversity", name: university?.institution },
    knowsLanguage: [...profile.languages],
    address: {
      "@type": "PostalAddress",
      addressLocality: profile.city,
      addressCountry: profile.countryCode,
    },
  };
}

/** JSON text that is safe inside a `<script>` element: `<` cannot close the element. */
export function serializeJsonLd(data: Readonly<Record<string, unknown>>): string {
  return JSON.stringify(data).replaceAll("<", "\\u003c");
}
