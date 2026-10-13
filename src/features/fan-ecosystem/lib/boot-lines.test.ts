import { describe, expect, it } from "vitest";

import { ecosystemFacts } from "../content/facts";
import { fanEcosystemSection } from "../index";
import { buildEcosystemBootLines } from "./boot-lines";

describe("ecosystem boot lines", () => {
  it("FAN-AC06: is exactly the line of the spec", () => {
    expect(fanEcosystemSection.bootLines).toEqual([
      { message: "fan0: personal ecosystem online (CachyOS, Hyprland)", status: "ok" },
    ]);
  });

  it("leaves the tools empty when there is no system entry", () => {
    expect(buildEcosystemBootLines({ ...ecosystemFacts, setup: [] })).toEqual([
      { message: "fan0: personal ecosystem online ()", status: "ok" },
    ]);
  });
});
