import { describe, expect, it } from "vitest";

import { LABEL_GAP, LABEL_MARGIN_PX, labelPosition } from "./label-position";

const stage = { width: 800, height: 450 }; // Half a pixel per scene unit.
const label = { width: 100, height: 40 };
const hitBox = { left: 600, top: 300, right: 800, bottom: 500 };
const base = { hitBox, shift: 0, label, stage };

describe("labelPosition", () => {
  it("leaves 12 units between the hit area and the label, and 8 px to the border of the stage", () => {
    expect([LABEL_GAP, LABEL_MARGIN_PX]).toEqual([12, 8]);
  });

  it("places the label above, centered on the top side", () => {
    expect(labelPosition({ ...base, placement: "top" })).toEqual({ left: 300, top: 104 });
  });

  it("places the label below, centered on the bottom side", () => {
    expect(labelPosition({ ...base, placement: "bottom" })).toEqual({ left: 300, top: 256 });
  });

  it("places the label to the left, centered on that side", () => {
    expect(labelPosition({ ...base, placement: "left" })).toEqual({ left: 194, top: 180 });
  });

  it("places the label to the right, centered on that side", () => {
    expect(labelPosition({ ...base, placement: "right" })).toEqual({ left: 406, top: 180 });
  });

  it("moves the label along its side by the shift of the calibration", () => {
    expect(labelPosition({ ...base, placement: "top", shift: 60 })).toEqual({
      left: 330,
      top: 104,
    });
    expect(labelPosition({ ...base, placement: "bottom", shift: -40 })).toEqual({
      left: 280,
      top: 256,
    });
    expect(labelPosition({ ...base, placement: "right", shift: 20 })).toEqual({
      left: 406,
      top: 190,
    });
  });

  it("SCN-AC09: keeps the label inside the stage, 8 px from each border", () => {
    const corner = { left: 16, top: 16, right: 100, bottom: 100 };
    expect(labelPosition({ ...base, hitBox: corner, placement: "top" })).toEqual({
      left: 8,
      top: 8,
    });
    expect(labelPosition({ ...base, hitBox: corner, placement: "left" })).toEqual({
      left: 8,
      top: 9,
    });

    const opposite = { left: 1500, top: 800, right: 1584, bottom: 884 };
    expect(labelPosition({ ...base, hitBox: opposite, placement: "bottom" })).toEqual({
      left: 692,
      top: 402,
    });
    expect(labelPosition({ ...base, hitBox: opposite, placement: "right" })).toEqual({
      left: 692,
      top: 401,
    });
  });

  it("scales with the stage", () => {
    const large = { width: 1600, height: 900 };
    expect(labelPosition({ ...base, stage: large, placement: "top" })).toEqual({
      left: 650,
      top: 248,
    });
  });
});
