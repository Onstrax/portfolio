import type { BootLine } from "@/shared/contracts/section";

import type { StackFacts } from "../types";

/** Line that the stack contributes to the boot log: groups and technologies (RAM-R09). */
export function buildStackBootLines(facts: StackFacts): readonly BootLine[] {
  const modules = facts.groups.reduce((total, group) => total + group.items.length, 0);
  return [
    {
      message: `Memory: ${String(facts.groups.length)} banks, ${String(modules)} modules online`,
      status: "ok",
    },
  ];
}
