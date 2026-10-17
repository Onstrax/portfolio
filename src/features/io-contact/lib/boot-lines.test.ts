import { describe, expect, it } from "vitest";

import { contactFacts } from "../content/facts";
import { ioContactSection } from "../index";
import { buildContactBootLines } from "./boot-lines";

describe("contact boot lines", () => {
  it("IO-AC06: is exactly the line of the spec", () => {
    expect(ioContactSection.bootLines).toEqual([
      { message: "io: 4 ports up (email, whatsapp, linkedin, github)", status: "ok" },
    ]);
  });

  it("counts and names the channels it receives", () => {
    const [email] = contactFacts.channels;
    expect(
      buildContactBootLines({ email: contactFacts.email, channels: [email], references: [] }),
    ).toEqual([{ message: "io: 1 ports up (email)", status: "ok" }]);
  });
});
