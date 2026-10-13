import type { BootLine } from "@/shared/contracts/section";

import type { AboutFacts } from "../types";

/** Line that this section contributes to the boot log: the framework of the site (CMOS-R08). */
export function buildAboutBootLines(facts: AboutFacts): readonly BootLine[] {
  const [framework = ""] = facts.stack;
  return [
    {
      message: `rtc_cmos: about this site (spec-driven, built with ${framework})`,
      status: "none",
    },
  ];
}
