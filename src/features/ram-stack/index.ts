import type { SectionDefinition } from "@/shared/contracts/section";

import { StackSection } from "./components/stack-section";
import { stackEn } from "./content/en";
import { stackEs } from "./content/es";
import { stackFacts } from "./content/facts";
import { buildStackBootLines } from "./lib/boot-lines";
import type { StackFacts, StackText } from "./types";

export const ramStackSection: SectionDefinition<"ram", StackFacts, StackText> = {
  componentId: "ram",
  slug: "stack",
  facts: stackFacts,
  text: { es: stackEs, en: stackEn },
  bootLines: buildStackBootLines(stackFacts),
  Section: StackSection,
};
