import type { BootLine } from "@/shared/contracts/section";

import type { ProfileFacts, ProfileText } from "../types";

/** "Native" becomes "native"; a code such as "C1" stays as it is. Anything after a comma is dropped. */
function shortLevel(level: string): string {
  const [first = ""] = level.split(",");
  return /^[A-Z][a-z]/.test(first) ? first.toLowerCase() : first;
}

/** Lines that the profile contributes to the boot log, built from its facts and English text (CPU-R11). */
export function buildProfileBootLines(
  facts: ProfileFacts,
  english: ProfileText,
): readonly BootLine[] {
  const languages = facts.languages
    .map((id) => `${id} (${shortLevel(english.languages[id].level)})`)
    .join(", ");
  return [
    { message: `cpu0: ${facts.name} (${english.degree})`, status: "none" },
    { message: `Language packs loaded: ${languages}`, status: "ok" },
  ];
}
