import type { ProjectFact, ProjectsText } from "../types";

/**
 * Name of a project: its proper name, written once in the facts, or the descriptive name of the
 * language (SSD-R02).
 */
export function projectName(project: ProjectFact, text: ProjectsText): string {
  return project.properName ?? text.projects[project.id].name ?? "";
}
