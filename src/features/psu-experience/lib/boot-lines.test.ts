import { describe, expect, it } from "vitest";

import { experienceFacts } from "../content/facts";
import { psuExperienceSection } from "../index";
import { buildExperienceBootLines } from "./boot-lines";

describe("experience boot lines", () => {
  it("PSU-AC05: is exactly the line of the spec and fits in 72 characters", () => {
    expect(psuExperienceSection.bootLines).toEqual([
      { message: "psu0: 3 rails online (teaching, freelance, tutoring)", status: "ok" },
    ]);
    expect(psuExperienceSection.bootLines[0]?.message.length).toBeLessThanOrEqual(72);
  });

  it("counts and names the jobs it receives", () => {
    const [first] = experienceFacts.jobs;
    expect(buildExperienceBootLines({ ...experienceFacts, jobs: [first] })[0]?.message).toBe(
      "psu0: 1 rails online (teaching)",
    );
  });
});
