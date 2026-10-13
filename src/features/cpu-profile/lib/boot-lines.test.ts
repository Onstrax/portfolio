import { describe, expect, it } from "vitest";

import { profileEn } from "../content/en";
import { profileFacts } from "../content/facts";
import { cpuProfileSection } from "../index";
import { buildProfileBootLines } from "./boot-lines";

describe("profile boot lines", () => {
  it("CPU-AC06: are exactly the two lines of the spec", () => {
    expect(cpuProfileSection.bootLines).toEqual([
      {
        message: "cpu0: Juan Esteban Álvarez García (Systems and Computing Engineering)",
        status: "none",
      },
      { message: "Language packs loaded: es (native), en (C1), de (B1)", status: "ok" },
    ]);
  });

  it("follows the order of the languages in the facts", () => {
    const lines = buildProfileBootLines({ ...profileFacts, languages: ["de", "es"] }, profileEn);
    expect(lines[1]?.message).toBe("Language packs loaded: de (B1), es (native)");
  });
});
