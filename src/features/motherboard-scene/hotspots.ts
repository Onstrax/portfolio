import type { SceneVariant } from "@/shared/contracts/assets";
import type { SceneObjectId } from "@/shared/contracts/ids";

import type { Hotspot, ScenePoint } from "./types";

/** Builds a polygon from `x, y` pairs, to keep the calibration data readable. */
function polygon(...pairs: readonly (readonly [number, number])[]): readonly ScenePoint[] {
  return pairs.map(([x, y]) => ({ x, y }));
}

/**
 * Version of the master of each variant on which these polygons were checked (SCN-R09). A test
 * fails when a master changes and the calibration has not been reviewed (AST-R41).
 */
export const HOTSPOTS_CALIBRATED_FOR: Readonly<Record<SceneVariant, string>> = {
  photo: "dc169b385cc7",
  sketch: "b71cba0939ff",
};

/**
 * Calibration of the nine objects of the scene (AST §4.8), in scene units. Both variants share
 * it, because their objects are in the same place (AST-R50).
 */
export const HOTSPOTS: Readonly<Record<SceneObjectId, Hotspot>> = {
  cpu: {
    id: "cpu",
    polygon: polygon([764, 296], [872, 296], [872, 446], [852, 460], [784, 460], [764, 446]),
    labelPlacement: "top",
  },
  psu: {
    id: "psu",
    polygon: polygon(
      [46, 312],
      [359, 312],
      [389, 324],
      [389, 480],
      [440, 490],
      [480, 525],
      [492, 590],
      [488, 646],
      [389, 646],
      [359, 648],
      [46, 648],
    ),
    labelPlacement: "top",
  },
  ssd: {
    id: "ssd",
    polygon: polygon([702, 498], [889, 498], [889, 551], [702, 551]),
    labelPlacement: "bottom",
  },
  ram: {
    id: "ram",
    polygon: polygon([930, 208], [1014, 208], [1014, 532], [930, 532]),
    labelPlacement: "top",
    labelShift: 60,
  },
  io: {
    id: "io",
    polygon: polygon(
      [528, 157],
      [586, 157],
      [586, 194],
      [568, 226],
      [568, 264],
      [580, 284],
      [580, 386],
      [594, 397],
      [594, 443],
      [579, 449],
      [579, 511],
      [528, 511],
    ),
    labelPlacement: "top",
  },
  fan: {
    id: "fan",
    polygon: polygon(
      [1232, 119],
      [1458, 119],
      [1484, 145],
      [1484, 366],
      [1458, 392],
      [1232, 392],
      [1206, 366],
      [1206, 145],
    ),
    labelPlacement: "bottom",
    labelShift: 120,
  },
  cmos: {
    id: "cmos",
    polygon: polygon(
      [621, 454],
      [641, 454],
      [655, 468],
      [655, 488],
      [641, 503],
      [621, 503],
      [607, 488],
      [607, 468],
    ),
    labelPlacement: "bottom",
    labelShift: -34,
  },
  settings: {
    id: "settings",
    polygon: polygon([1226, 501], [1367, 567], [1344, 622], [1203, 554]),
    labelPlacement: "bottom",
  },
  "post-display": {
    id: "post-display",
    polygon: polygon([920, 795], [969, 795], [969, 829], [920, 829]),
    labelPlacement: "left",
  },
};
