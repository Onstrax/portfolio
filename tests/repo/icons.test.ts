import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { readRepoFile, REPO_ROOT } from "./files";

/** Width and height of a PNG, read from its IHDR chunk. */
function pngSize(file: string): readonly [number, number] {
  const bytes = readFileSync(path.join(REPO_ROOT, file));
  expect(bytes.subarray(1, 4).toString("latin1")).toBe("PNG");
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

describe("site icons", () => {
  it("SMP-AC15: icon.svg is the 32-unit icon and apple-icon.png measures 180×180 px", () => {
    const icon = readRepoFile("src/app/icon.svg");
    expect(icon).toContain('viewBox="0 0 32 32"');
    expect(icon).toContain('<rect width="32" height="32" rx="6"');
    expect(icon).toContain('<rect x="9" y="9" width="14" height="14"/>');
    expect(pngSize("src/app/apple-icon.png")).toEqual([180, 180]);
  });
});
