import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CV_FILES } from "../../src/shared/config/site";
import { REPO_ROOT } from "./files";

describe("published résumés", () => {
  it("IO-AC02: CV_FILES points to two PDF files in public that weigh less than 500 kB", () => {
    expect(CV_FILES).toEqual({
      es: "/cv/juan-esteban-alvarez-garcia-cv-es.pdf",
      en: "/cv/juan-esteban-alvarez-garcia-cv-en.pdf",
    });
    for (const file of Object.values(CV_FILES)) {
      const absolute = path.join(REPO_ROOT, "public", file);
      expect(readFileSync(absolute).subarray(0, 4).toString("latin1"), file).toBe("%PDF");
      expect(statSync(absolute).size, file).toBeLessThan(500_000);
    }
  });

  it("carries only the title and the author in its document properties (IO-R04)", () => {
    for (const file of Object.values(CV_FILES)) {
      const content = readFileSync(path.join(REPO_ROOT, "public", file)).toString("latin1");
      expect(content, file).toMatch(/\/Title\s*\(/);
      expect(content, file).toMatch(/\/Author\s*\(/);
      for (const key of ["Creator", "Producer", "CreationDate", "ModDate"]) {
        expect(
          content.includes(`/${key} (`) || content.includes(`/${key}(`),
          `${file} ${key}`,
        ).toBe(false);
      }
      expect(content, file).not.toMatch(/<xmp:CreatorTool>|<pdf:Producer>|<xmp:CreateDate>/);
    }
  });
});
