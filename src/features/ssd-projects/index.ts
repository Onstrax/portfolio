import type { SectionDefinition } from "@/shared/contracts/section";

import { ProjectsSection } from "./components/projects-section";
import { projectsEn } from "./content/en";
import { projectsEs } from "./content/es";
import { projectsFacts } from "./content/facts";
import { buildProjectsBootLines } from "./lib/boot-lines";
import type { ProjectsFacts, ProjectsText } from "./types";

export const ssdProjectsSection: SectionDefinition<"ssd", ProjectsFacts, ProjectsText> = {
  componentId: "ssd",
  slug: "projects",
  facts: projectsFacts,
  text: { es: projectsEs, en: projectsEn },
  bootLines: buildProjectsBootLines(projectsFacts, projectsEn),
  Section: ProjectsSection,
};
