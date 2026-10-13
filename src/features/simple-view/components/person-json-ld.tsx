import type { Locale } from "@/shared/contracts/locale";

import { buildPersonJsonLd, serializeJsonLd } from "../lib/person-json-ld";

interface PersonJsonLdProps {
  readonly locale: Locale;
}

/** Structured data about the author, as a data block that browsers do not execute (SMP-R18). */
export function PersonJsonLd({ locale }: PersonJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildPersonJsonLd(locale)) }}
    />
  );
}
