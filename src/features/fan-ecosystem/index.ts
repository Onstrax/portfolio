import type { SectionDefinition } from "@/shared/contracts/section";

import { EcosystemSection } from "./components/ecosystem-section";
import { ecosystemEn } from "./content/en";
import { ecosystemEs } from "./content/es";
import { ecosystemFacts } from "./content/facts";
import { buildEcosystemBootLines } from "./lib/boot-lines";
import type { EcosystemFacts, EcosystemText } from "./types";

export const fanEcosystemSection: SectionDefinition<"fan", EcosystemFacts, EcosystemText> = {
  componentId: "fan",
  slug: "ecosystem",
  facts: ecosystemFacts,
  text: { es: ecosystemEs, en: ecosystemEn },
  bootLines: buildEcosystemBootLines(ecosystemFacts),
  Section: EcosystemSection,
};
