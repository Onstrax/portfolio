import { describe, expect, it } from "vitest";

import { HOTSPOTS } from "../hotspots";
import { arrowDirection, type PlacedZone, zoneInDirection, zoneCenter } from "./arrow-navigation";

const ORIGIN = { x: 500, y: 500 };

function zone(id: PlacedZone["id"], x: number, y: number): PlacedZone {
  return { id, center: { x, y } };
}

describe("arrowDirection", () => {
  it("reads the four arrow keys and nothing else", () => {
    expect(arrowDirection("ArrowUp")).toBe("up");
    expect(arrowDirection("ArrowDown")).toBe("down");
    expect(arrowDirection("ArrowLeft")).toBe("left");
    expect(arrowDirection("ArrowRight")).toBe("right");
    expect(arrowDirection("Enter")).toBeNull();
    expect(arrowDirection("Tab")).toBeNull();
  });
});

describe("zoneInDirection", () => {
  it("SCN-AC19: picks the nearest zone within 45 degrees, weighting the sideways offset", () => {
    const zones = [
      zone("cpu", 850, 500),
      zone("ram", 620, 590),
      zone("ssd", 900, 500),
      zone("io", 560, 420),
    ];
    // ram: 120 ahead and 90 aside scores 300, less than cpu (350) and ssd (400); io scores less,
    // 60 ahead and 80 aside, but lies outside 45°.
    expect(zoneInDirection(ORIGIN, "right", zones)).toBe("ram");
  });

  it("SCN-AC19: falls back to the half plane when no zone is within 45 degrees", () => {
    const zones = [zone("cpu", 560, 300), zone("ram", 540, 200), zone("fan", 300, 500)];

    expect(zoneInDirection(ORIGIN, "right", zones)).toBe("cpu");
  });

  it("SCN-AC19: gives nothing when no zone lies in that direction", () => {
    const zones = [zone("cpu", 400, 500), zone("ram", 500, 700), zone("fan", 500, 500)];

    expect(zoneInDirection(ORIGIN, "up", zones)).toBeNull();
  });

  it("moves between the calibrated pieces as the scene shows them", () => {
    const zones: readonly PlacedZone[] = (
      ["cpu", "psu", "ssd", "ram", "io", "fan", "cmos", "settings"] as const
    ).map((id) => ({ id, center: zoneCenter(HOTSPOTS[id]) }));
    const from = (id: PlacedZone["id"]) => zoneCenter(HOTSPOTS[id]);

    expect(zoneInDirection(from("cpu"), "right", zones)).toBe("ram");
    expect(zoneInDirection(from("ram"), "left", zones)).toBe("cpu");
    expect(zoneInDirection(from("cpu"), "down", zones)).toBe("ssd");
    expect(zoneInDirection(from("fan"), "down", zones)).toBe("settings");
    expect(zoneInDirection(from("io"), "left", zones)).toBe("psu");
  });
});
