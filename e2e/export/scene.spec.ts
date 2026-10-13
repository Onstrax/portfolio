import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { SECTION_SLUGS } from "../../src/shared/contracts/ids";
import { LOCALES } from "../../src/shared/contracts/locale";
import { OUT_DIR, readExportedFile } from "../support/export";

const SCENE_DOCUMENTS = LOCALES.flatMap((locale) => [
  `${locale}/index.html`,
  ...SECTION_SLUGS.map((section) => `${locale}/${section}/index.html`),
]);
const PRE_PAINT_START = "(function(){var d=document.documentElement";

function headOf(html: string): string {
  return html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
}

/** Text files of the export in which code could end up. */
function listTextFiles(directory = OUT_DIR): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return listTextFiles(file);
    return /\.(?:html|js|css|txt|json|map)$/.test(entry.name) ? [file] : [];
  });
}

test("SYS-AC06: the pre-paint script is a plain script inside head, and the cv page has none", () => {
  expect(SCENE_DOCUMENTS).toHaveLength(16);
  for (const file of SCENE_DOCUMENTS) {
    const head = headOf(readExportedFile(file));
    const tag = new RegExp(`<script([^>]*)>${PRE_PAINT_START.replace(/[()]/g, "\\$&")}`).exec(head);
    expect(tag, file).not.toBeNull();
    expect(tag?.[1], file).toBe("");
  }
  for (const locale of LOCALES) {
    expect(readExportedFile(`${locale}/cv/index.html`)).not.toContain(PRE_PAINT_START);
  }
});

test("SYS-AC17: a section page holds its content in the base layer and no panel in the scene layer", () => {
  const html = readExportedFile("es/projects/index.html");
  const base = html.indexOf('data-layer="base"');
  const scene = html.indexOf('data-layer="scene"');
  const content = html.indexOf("Simulación de banca digital segura");

  expect(base).toBeGreaterThan(-1);
  expect(scene).toBeGreaterThan(base);
  expect(content).toBeGreaterThan(base);
  expect(content).toBeLessThan(scene);

  const sceneLayer = html.slice(scene);
  expect(sceneLayer).not.toContain("<dialog");
  expect(sceneLayer).not.toContain("<main");
  expect(sceneLayer).toContain('data-testid="scene-poster"');
});

test("SCN-AC15, AST-AC18: the export holds nothing of the calibration overlay", () => {
  const marker = ["debug", "hotspots"].join("=");
  const files = listTextFiles();

  expect(files.length).toBeGreaterThan(40);
  expect(files.filter((file) => readFileSync(file, "utf8").includes(marker))).toEqual([]);
});

test("PNL-AC12: no exported page contains a dialog element", () => {
  for (const file of SCENE_DOCUMENTS) {
    expect(readExportedFile(file), file).not.toContain("<dialog");
  }
});

test("BOOT-AC04: the home holds the whole boot log, marked as English and decorative; the cv page has none", () => {
  const html = readExportedFile("es/index.html");
  const screen = html.indexOf('data-testid="boot-screen"');
  const log = /<div[^>]*data-part="log"[^>]*>/.exec(html.slice(screen))?.[0] ?? "";

  expect(screen).toBeGreaterThan(html.indexOf('data-layer="scene"'));
  expect(log).toContain('lang="en"');
  expect(log).toContain('aria-hidden="true"');
  for (const fragment of [
    "Booting portfolio kernel 1.0 (juan-esteban-alvarez-garcia)",
    "Detecting hardware on motherboard...",
    "cpu0: Juan Esteban Álvarez García",
    "Starting graphical interface...",
    "Reached target portfolio.target",
    "[    0.000000]",
    "[    0.142512]",
  ]) {
    expect(html.slice(screen), fragment).toContain(fragment);
  }
  expect((html.slice(screen).match(/data-part="line"/g) ?? []).length).toBeGreaterThanOrEqual(11);

  for (const locale of LOCALES) {
    expect(readExportedFile(`${locale}/cv/index.html`)).not.toContain('data-testid="boot-screen"');
  }
});
