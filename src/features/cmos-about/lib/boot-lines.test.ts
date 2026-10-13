import { describe, expect, it } from "vitest";

import { aboutFacts } from "../content/facts";
import { cmosAboutSection } from "../index";
import { buildAboutBootLines } from "./boot-lines";

describe("about boot lines", () => {
  it("CMOS-AC05: is exactly the line of the spec", () => {
    expect(cmosAboutSection.bootLines).toEqual([
      { message: "rtc_cmos: about this site (spec-driven, built with Next.js)", status: "none" },
    ]);
  });

  it("names the first technology of the stack it receives", () => {
    expect(buildAboutBootLines({ ...aboutFacts, stack: ["Astro"] })[0]?.message).toBe(
      "rtc_cmos: about this site (spec-driven, built with Astro)",
    );
    expect(buildAboutBootLines({ ...aboutFacts, stack: [] })[0]?.message).toBe(
      "rtc_cmos: about this site (spec-driven, built with )",
    );
  });
});
