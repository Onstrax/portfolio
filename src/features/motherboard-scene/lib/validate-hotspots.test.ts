import { describe, expect, it } from "vitest";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";
import { SCENE_VARIANTS } from "@/shared/contracts/assets";
import { SCENE_OBJECT_IDS, type SceneObjectId } from "@/shared/contracts/ids";

import { HOTSPOTS, HOTSPOTS_CALIBRATED_FOR } from "../hotspots";
import type { Hotspot, ScenePoint } from "../types";
import { boxToPolygon } from "./geometry";
import { type HotspotRule, MIN_SIZES, validateHotspots } from "./validate-hotspots";

function rectangle(
  left: number,
  top: number,
  width: number,
  height: number,
): readonly ScenePoint[] {
  return boxToPolygon({ left, top, right: left + width, bottom: top + height });
}

/** The real calibration with the silhouette of one object replaced. */
function withPolygon(
  id: SceneObjectId,
  polygon: readonly ScenePoint[],
): Readonly<Record<SceneObjectId, Hotspot>> {
  return { ...HOTSPOTS, [id]: { ...HOTSPOTS[id], polygon } };
}

function rulesOf(hotspots: Readonly<Record<SceneObjectId, Hotspot>>): readonly HotspotRule[] {
  return validateHotspots(hotspots).map((issue) => issue.rule);
}

describe("calibration data", () => {
  it("SCN-AC02: the real hotspots break no rule", () => {
    expect(validateHotspots(HOTSPOTS)).toEqual([]);
  });

  it("SCN-AC02: has one entry per scene object, under its own identifier", () => {
    expect(Object.keys(HOTSPOTS)).toEqual([...SCENE_OBJECT_IDS]);
    for (const id of SCENE_OBJECT_IDS) expect(HOTSPOTS[id].id).toBe(id);
  });

  it("AST-AC17: was checked against the current master of each variant", () => {
    for (const variant of SCENE_VARIANTS) {
      expect(HOTSPOTS_CALIBRATED_FOR[variant], variant).toBe(SCENE_ASSETS[variant].version);
    }
  });

  it("declares the minimum size of every object of the inventory", () => {
    expect(Object.keys(MIN_SIZES)).toEqual([...SCENE_OBJECT_IDS]);
  });
});

describe("validateHotspots", () => {
  it("SCN-AC03: marks a silhouette with fewer than 4 or more than 24 vertices", () => {
    const triangle = [
      { x: 764, y: 296 },
      { x: 872, y: 296 },
      { x: 818, y: 460 },
    ];
    const circle = Array.from({ length: 25 }, (_, index) => ({
      x: 818 + 54 * Math.cos((index / 25) * 2 * Math.PI),
      y: 378 + 54 * Math.sin((index / 25) * 2 * Math.PI),
    }));

    expect(validateHotspots(withPolygon("cpu", triangle))).toEqual([
      {
        rule: "SCN-R08",
        ids: ["cpu"],
        message: "cpu: has 3 vertices, outside the range 4 to 24",
      },
    ]);
    expect(rulesOf(withPolygon("cpu", circle))).toEqual(["SCN-R08"]);
  });

  it("SCN-AC03: marks a vertex outside the safe area", () => {
    expect(validateHotspots(withPolygon("psu", rectangle(10, 312, 400, 336)))).toEqual([
      { rule: "SCN-R08", ids: ["psu"], message: "psu: has a vertex outside the safe area" },
    ]);
    expect(rulesOf(withPolygon("post-display", rectangle(920, 850, 49, 40)))).toEqual(["SCN-R08"]);
  });

  it("SCN-AC03: marks a silhouette that crosses itself", () => {
    const bowTie = [
      { x: 764, y: 296 },
      { x: 872, y: 460 },
      { x: 872, y: 296 },
      { x: 764, y: 460 },
    ];
    expect(validateHotspots(withPolygon("cpu", bowTie))).toEqual([
      { rule: "SCN-R08", ids: ["cpu"], message: "cpu: crosses itself" },
    ]);
  });

  it("SCN-AC03: marks an object smaller than its minimum, on either side", () => {
    expect(validateHotspots(withPolygon("cpu", rectangle(764, 296, 108, 80)))).toEqual([
      {
        rule: "AST-R20",
        ids: ["cpu"],
        message: "cpu: measures 108×80 units, below its minimum of 88×88",
      },
    ]);
    expect(rulesOf(withPolygon("ram", rectangle(930, 208, 84, 170)))).toEqual(["AST-R20"]);
  });

  it("SCN-AC03: marks two silhouettes less than 12 units apart", () => {
    expect(validateHotspots(withPolygon("ssd", rectangle(702, 470, 187, 81)))).toEqual([
      {
        rule: "AST-R11",
        ids: ["cpu", "ssd"],
        message: "cpu and ssd: their silhouettes are 10 units apart, less than 12",
      },
    ]);
  });

  it("SCN-AC03: marks an object inside the corner reserved for the fixed bar", () => {
    expect(validateHotspots(withPolygon("fan", rectangle(1206, 60, 278, 273)))).toEqual([
      {
        rule: "AST-R47",
        ids: ["fan"],
        message: "fan: occupies the corner reserved for the fixed bar",
      },
    ]);
    // No vertex inside the corner, but the silhouette runs across it.
    expect(rulesOf(withPolygon("fan", rectangle(1100, 50, 480, 300)))).toContain("AST-R47");
  });

  it("SCN-AC03: marks two hit areas that overlap", () => {
    // The coin sits in the notch of the port panel: 13 units from its silhouette, but inside the
    // box that the panel uses as hit area.
    expect(validateHotspots(withPolygon("cmos", rectangle(593, 300, 48, 49)))).toEqual([
      { rule: "SCN-R13", ids: ["io", "cmos"], message: "io and cmos: their hit areas overlap" },
    ]);
  });
});
