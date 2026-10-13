import type { BootLine } from "@/shared/contracts/section";

import type { ProjectsFacts, ProjectsText } from "../types";
import { projectName } from "./project-name";

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** Lines that the projects contribute to the boot log: the totals and the first featured (SSD-R10). */
export function buildProjectsBootLines(
  facts: ProjectsFacts,
  english: ProjectsText,
): readonly BootLine[] {
  const featured = facts.projects.filter((project) => project.featured);
  const lines: BootLine[] = [
    {
      message: `nvme0n1: ${String(facts.projects.length)} projects mounted, ${String(featured.length)} featured`,
      status: "ok",
    },
  ];
  const [first] = featured;
  if (first !== undefined) {
    lines.push({ message: `Loading ${lowerFirst(projectName(first, english))}`, status: "none" });
  }
  return lines;
}
