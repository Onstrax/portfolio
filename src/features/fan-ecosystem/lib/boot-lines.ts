import type { BootLine } from "@/shared/contracts/section";

import type { EcosystemFacts } from "../types";

/** Line that the ecosystem contributes to the boot log: the tools of the system (FAN-R08). */
export function buildEcosystemBootLines(facts: EcosystemFacts): readonly BootLine[] {
  const system = facts.setup.find((item) => item.id === "system");
  const tools = (system?.tools ?? []).join(", ");
  return [{ message: `fan0: personal ecosystem online (${tools})`, status: "ok" }];
}
