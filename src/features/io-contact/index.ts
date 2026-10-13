import type { SectionDefinition } from "@/shared/contracts/section";

import { ContactSection } from "./components/contact-section";
import { contactEn } from "./content/en";
import { contactEs } from "./content/es";
import { contactFacts } from "./content/facts";
import { buildContactBootLines } from "./lib/boot-lines";
import type { ContactFacts, ContactText } from "./types";

export const ioContactSection: SectionDefinition<"io", ContactFacts, ContactText> = {
  componentId: "io",
  slug: "contact",
  facts: contactFacts,
  text: { es: contactEs, en: contactEn },
  bootLines: buildContactBootLines(contactFacts),
  Section: ContactSection,
};
