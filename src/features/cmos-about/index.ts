import type { SectionDefinition } from "@/shared/contracts/section";

import { AboutSection } from "./components/about-section";
import { aboutEn } from "./content/en";
import { aboutEs } from "./content/es";
import { aboutFacts } from "./content/facts";
import { buildAboutBootLines } from "./lib/boot-lines";
import type { AboutFacts, AboutText } from "./types";

export const cmosAboutSection: SectionDefinition<"cmos", AboutFacts, AboutText> = {
  componentId: "cmos",
  slug: "about",
  facts: aboutFacts,
  text: { es: aboutEs, en: aboutEn },
  bootLines: buildAboutBootLines(aboutFacts),
  Section: AboutSection,
};
