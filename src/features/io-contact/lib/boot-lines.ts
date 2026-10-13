import type { BootLine } from "@/shared/contracts/section";

import type { ContactFacts } from "../types";

/** Line that the contact section contributes to the boot log: its channels (IO-R16). */
export function buildContactBootLines(facts: ContactFacts): readonly BootLine[] {
  const channels = facts.channels.map((channel) => channel.id).join(", ");
  return [{ message: `io: ${String(facts.channels.length)} ports up (${channels})`, status: "ok" }];
}
