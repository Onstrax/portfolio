import type { SectionDefinition } from "@/shared/contracts/section";

import { ExperienceSection } from "./components/experience-section";
import { experienceEn } from "./content/en";
import { experienceEs } from "./content/es";
import { experienceFacts } from "./content/facts";
import { buildExperienceBootLines } from "./lib/boot-lines";
import type { ExperienceFacts, ExperienceText } from "./types";

export const psuExperienceSection: SectionDefinition<"psu", ExperienceFacts, ExperienceText> = {
  componentId: "psu",
  slug: "experience",
  facts: experienceFacts,
  text: { es: experienceEs, en: experienceEn },
  bootLines: buildExperienceBootLines(experienceFacts),
  Section: ExperienceSection,
};
