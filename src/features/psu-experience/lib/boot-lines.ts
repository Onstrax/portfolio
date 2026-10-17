import type { BootLine } from "@/shared/contracts/section";

import type { ExperienceFacts, JobId } from "../types";

/** One English keyword per job, for the boot log (PSU-R09). */
export const BOOT_KEYWORDS: Readonly<Record<JobId, string>> = {
  freelance: "freelance",
  "teaching-assistant": "teaching",
  tutor: "tutoring",
};

/** Line that the experience contributes to the boot log: how many jobs and which (PSU-R09). */
export function buildExperienceBootLines(facts: ExperienceFacts): readonly BootLine[] {
  const keywords = facts.jobs.map((job) => BOOT_KEYWORDS[job.id]).join(", ");
  return [
    { message: `psu0: ${String(facts.jobs.length)} rails online (${keywords})`, status: "ok" },
  ];
}
