import { execFile } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const BUILD = path.join(REPO, "scripts/build-assets.mjs");
const CHECK = path.join(REPO, "scripts/check-assets.mjs");
const run = promisify(execFile);

const PHOTO = "design/scene/master.png";
const SKETCH = "design/scene/master-sketch.png";
const MANIFEST = "src/shared/assets/manifest.generated.ts";
const DARK = 20;
const LIGHT = 235;

vi.setConfig({ testTimeout: 120_000, hookTimeout: 300_000 });

let root = "";
const originals = new Map<string, Buffer>();

function at(file: string): string {
  return path.join(root, file);
}

/** A 3840×2160 master of one flat gray level, optionally with a single different pixel. */
async function master(level: number, firstPixel = level): Promise<Buffer> {
  const pixels = Buffer.alloc(3840 * 2160 * 3, level);
  pixels[0] = firstPixel;
  return sharp(pixels, { raw: { width: 3840, height: 2160, channels: 3 } })
    .png()
    .toBuffer();
}

/** A master of one gray level with a square of another level painted on it. */
async function masterWithSquare(
  level: number,
  square: {
    readonly left: number;
    readonly top: number;
    readonly size: number;
    readonly level: number;
  },
): Promise<Buffer> {
  const patch = await sharp({
    create: {
      width: square.size,
      height: square.size,
      channels: 3,
      background: { r: square.level, g: square.level, b: square.level },
    },
  })
    .png()
    .toBuffer();
  return sharp(await master(level))
    .composite([{ input: patch, left: square.left, top: square.top }])
    .removeAlpha()
    .png()
    .toBuffer();
}

function provenance(photoState: string, sketchState: string): string {
  const section = (title: string, state: string): string =>
    `## ${title}\n\n| Campo | Valor |\n| --- | --- |\n| Estado | \`${state}\` |\n`;
  return [
    "# Sample provenance\n",
    section("Máster de la variante fotografía (`photo`)", photoState),
    section("Máster de la variante boceto (`sketch`)", sketchState),
  ].join("\n");
}

async function check(...flags: readonly string[]): Promise<{ code: number; output: string }> {
  try {
    const { stdout, stderr } = await run("node", [CHECK, "--root", root, ...flags]);
    return { code: 0, output: stdout + stderr };
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string };
    return { code: failure.code ?? -1, output: (failure.stdout ?? "") + (failure.stderr ?? "") };
  }
}

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "assets-"));
  await mkdir(at("design/scene"), { recursive: true });
  await mkdir(at("design/portrait"), { recursive: true });
  await mkdir(at("src/app"), { recursive: true });
  await writeFile(at(PHOTO), await master(DARK));
  await writeFile(at(SKETCH), await master(LIGHT));
  await writeFile(at("design/scene/PROVENANCE.md"), provenance("accepted", "provisional"));
  await sharp({ create: { width: 699, height: 762, channels: 3, background: "#8090a0" } })
    .jpeg()
    .toFile(at("design/portrait/source.jpg"));
  await copyFile(path.join(REPO, "src/app/icon.svg"), at("src/app/icon.svg"));
  await mkdir(at("src/styles"), { recursive: true });
  await copyFile(path.join(REPO, "src/styles/tokens.css"), at("src/styles/tokens.css"));

  await run("node", [BUILD, "--root", root]);

  for (const file of [PHOTO, SKETCH, MANIFEST]) originals.set(file, await readFile(at(file)));
});

afterEach(async () => {
  for (const [file, content] of originals) await writeFile(at(file), content);
});

afterAll(async () => {
  if (root !== "") await rm(root, { recursive: true });
});

describe("assets:build", () => {
  it("writes nine scene derivatives per variant, named after the version of their master", async () => {
    const files = await readdir(at("public/scene"));
    const versions = [...new Set(files.map((file) => file.split(".")[1]))];
    expect(files).toHaveLength(18);
    expect(versions).toHaveLength(2);
    for (const version of versions) {
      expect(files.filter((file) => file.includes(`.${version ?? ""}.`)).sort()).toEqual(
        [1920, 2560, 3840]
          .flatMap((width) =>
            ["avif", "jpg", "webp"].map(
              (extension) => `scene-${String(width)}.${version ?? ""}.${extension}`,
            ),
          )
          .sort(),
      );
    }
  });

  it("writes the portrait, the sharing image, the touch icon and the manifest", async () => {
    expect(await readdir(at("public/portrait"))).toHaveLength(9);
    expect(await readdir(at("public/og"))).toHaveLength(1);
    const icon = await sharp(at("src/app/apple-icon.png")).metadata();
    expect([icon.width, icon.height]).toEqual([180, 180]);

    const manifest = await readFile(at(MANIFEST), "utf8");
    expect(manifest.startsWith("// Generated by scripts/build-assets.mjs")).toBe(true);
    expect(manifest).toContain("export const SCENE_ASSETS = {");
    expect(manifest).toContain("export const PORTRAIT_ASSET = {");
    expect(manifest).toContain("export const OG_ASSET = {");
    expect(manifest).toContain(
      'export const SITE_THEME = {\n  "themeColor": "#0a0907"\n} as const satisfies SiteTheme;',
    );
  });

  it("marks in the manifest the masters that the provenance record calls provisional", async () => {
    const manifest = await readFile(at(MANIFEST), "utf8");
    const [photo = "", sketch = ""] = manifest.split('"sketch": {');
    expect(photo).toContain('"provisional": false');
    expect(sketch).toContain('"provisional": true');
  });
});

describe("assets:check", () => {
  it("AST-AC21: accepts a dark photograph and a light sketch", async () => {
    const result = await check();
    expect(result.output).toContain("assets:check: everything matches");
    expect(result.code).toBe(0);
  });

  it("AST-AC15: fails with a version mismatch when a single pixel of a master changes", async () => {
    await writeFile(at(PHOTO), await master(DARK, DARK + 1));
    const photo = await check();
    expect(photo.code).toBe(1);
    expect(photo.output).toMatch(/master\.png.*version.*does not match/);

    await writeFile(at(PHOTO), originals.get(PHOTO) ?? "");
    await writeFile(at(SKETCH), await master(LIGHT, LIGHT - 1));
    const sketch = await check();
    expect(sketch.code).toBe(1);
    expect(sketch.output).toMatch(/master-sketch\.png.*version.*does not match/);
  });

  it("AST-AC16: passes with a provisional master, and fails for a release", async () => {
    expect((await check()).code).toBe(0);

    const release = await check("--release");
    expect(release.code).toBe(1);
    expect(release.output).toMatch(/sketch.*provisional/);
  });

  it("AST-AC16: passes for a release when no master is provisional", async () => {
    const manifest = (originals.get(MANIFEST) ?? "").toString();
    await writeFile(at(MANIFEST), manifest.replace('"provisional": true', '"provisional": false'));
    expect((await check("--release")).code).toBe(0);
  });

  it("AST-AC21: rejects a photograph with a corner that is too bright", async () => {
    await writeFile(at(PHOTO), await master(200));
    const result = await check();
    expect(result.code).toBe(1);
    expect(result.output).toMatch(/master\.png.*corner.*AST-R14/);
  });

  it("AST-AC21: measures each corner on its own, not the image as a whole", async () => {
    // Dark everywhere except the top right corner, which sits between the two limits of AST-R14.
    await writeFile(
      at(PHOTO),
      await masterWithSquare(DARK, { left: 3840 - 384, top: 0, size: 384, level: 64 }),
    );
    const brightCorner = await check();
    expect(brightCorner.code).toBe(1);
    expect(brightCorner.output).toMatch(
      /master\.png: the top right corner is 25\.1 % bright.*AST-R14/,
    );
    expect(brightCorner.output).not.toMatch(/top left corner|bottom (?:left|right) corner/);

    // Bright in the middle, where the lamp lights the board, and dark in the four corners.
    await writeFile(
      at(PHOTO),
      await masterWithSquare(DARK, { left: 1000, top: 400, size: 1400, level: 230 }),
    );
    const brightCenter = await check();
    expect(brightCenter.output).not.toMatch(/corner/);
    expect(brightCenter.output).toMatch(/master\.png.*version.*does not match/);
  });

  it("AST-AC21: rejects a sketch with a corner that is too dark", async () => {
    await writeFile(at(SKETCH), await master(DARK));
    const result = await check();
    expect(result.code).toBe(1);
    expect(result.output).toMatch(/master-sketch\.png.*corner.*AST-R51/);
  });

  it("fails when a derivative is missing or an unknown file is left behind", async () => {
    const [first = ""] = (await readdir(at("public/scene"))).sort();
    const content = await readFile(at(`public/scene/${first}`));

    await rm(at(`public/scene/${first}`));
    const missing = await check();
    expect(missing.code).toBe(1);
    expect(missing.output).toContain(`${first} is missing`);

    await writeFile(at(`public/scene/${first}`), content);
    await writeFile(at("public/scene/scene-1920.000000000000.avif"), content);
    const extra = await check();
    await rm(at("public/scene/scene-1920.000000000000.avif"));
    expect(extra.code).toBe(1);
    expect(extra.output).toContain("scene-1920.000000000000.avif is not listed in the manifest");
  });

  it("fails when the theme color of the manifest differs from tokens.css", async () => {
    const manifest = (originals.get(MANIFEST) ?? "").toString();
    await writeFile(at(MANIFEST), manifest.replace('"#0a0907"', '"#000000"'));
    const result = await check();
    expect(result.code).toBe(1);
    expect(result.output).toContain("does not carry the theme color of tokens.css");
  });

  it("fails when a published image carries metadata", async () => {
    const [file = ""] = (await readdir(at("public/og"))).sort();
    const target = at(`public/og/${file}`);
    const clean = await readFile(target);
    await writeFile(
      target,
      await sharp(clean)
        .withExif({ IFD0: { Copyright: "Someone" } })
        .jpeg()
        .toBuffer(),
    );

    const result = await check();
    await writeFile(target, clean);

    expect(result.code).toBe(1);
    expect(result.output).toMatch(/og-image.*metadata/);
  });
});
