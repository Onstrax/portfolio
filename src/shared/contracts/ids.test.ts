import { describe, expect, it } from "vitest";

import {
  COMPONENT_IDS,
  componentOfSection,
  isComponentId,
  isPrimaryComponentId,
  isSectionSlug,
  PRIMARY_COMPONENT_IDS,
  PRIMARY_SECTION_SLUGS,
  SCENE_OBJECT_IDS,
  SECTION_BY_COMPONENT,
  SECTION_SLUGS,
  type SectionSlug,
} from "./ids";

const FOREIGN_VALUES: readonly unknown[] = ["gpu", "cv", "", null, undefined, 3];

describe("canonical identifiers", () => {
  it("TSC-AC06: SECTION_SLUGS is the canonical order and never contains the cv segment", () => {
    expect(SECTION_SLUGS).toEqual([
      "profile",
      "experience",
      "projects",
      "stack",
      "contact",
      "ecosystem",
      "about",
    ]);
    expect(SECTION_SLUGS).not.toContain("cv");
  });

  it("lists the six primary components first and cmos last", () => {
    expect(PRIMARY_COMPONENT_IDS).toEqual(["cpu", "psu", "ssd", "ram", "io", "fan"]);
    expect(COMPONENT_IDS).toEqual([...PRIMARY_COMPONENT_IDS, "cmos"]);
    expect(SCENE_OBJECT_IDS).toEqual([...COMPONENT_IDS, "settings", "post-display"]);
  });

  it("derives the six primary slugs from the primary components", () => {
    expect(PRIMARY_SECTION_SLUGS).toEqual(SECTION_SLUGS.slice(0, 6));
  });

  it("TSC-AC06: isComponentId accepts the seven components and rejects foreign values", () => {
    for (const id of COMPONENT_IDS) {
      expect(isComponentId(id)).toBe(true);
    }
    for (const value of [...FOREIGN_VALUES, "settings", "post-display"]) {
      expect(isComponentId(value)).toBe(false);
    }
  });

  it("TSC-AC06: isPrimaryComponentId accepts the six primaries and rejects cmos and foreign values", () => {
    for (const id of PRIMARY_COMPONENT_IDS) {
      expect(isPrimaryComponentId(id)).toBe(true);
    }
    for (const value of [...FOREIGN_VALUES, "cmos"]) {
      expect(isPrimaryComponentId(value)).toBe(false);
    }
  });

  it("TSC-AC06: isSectionSlug accepts the seven slugs and rejects foreign values", () => {
    for (const slug of SECTION_SLUGS) {
      expect(isSectionSlug(slug)).toBe(true);
    }
    for (const value of [...FOREIGN_VALUES, "cpu"]) {
      expect(isSectionSlug(value)).toBe(false);
    }
  });

  it("maps every section back to the component that opens it", () => {
    for (const id of COMPONENT_IDS) {
      expect(componentOfSection(SECTION_BY_COMPONENT[id])).toBe(id);
    }
  });

  it("throws for a slug that no component opens", () => {
    expect(() => componentOfSection("unknown" as SectionSlug)).toThrow(
      'No component opens section "unknown"',
    );
  });
});
