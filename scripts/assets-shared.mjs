// What `assets:build` and `assets:check` have in common: where the sources are, which derivatives
// exist, how heavy they may be and how a master is measured (AST §4.7, CPU §4.5, SMP §4.6).
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const KB = 1000;

export const MASTER = { width: 3840, height: 2160, maxBytes: 30 * KB * KB };
export const SCENE_SPACE = { width: 1600, height: 900 };
export const SAFE_AREA = { x: 16, y: 16, width: 1568, height: 868 };

/** Side, in scene units, of the corner squares whose brightness is measured (AST-R14). */
const CORNER_UNITS = 160;

export const SCENE_VARIANTS = [
  { id: "photo", master: "design/scene/master.png" },
  { id: "sketch", master: "design/scene/master-sketch.png" },
];

export const SCENE_SIZES = [
  { width: 1920, height: 1080, maxBytes: { avif: 350 * KB, webp: 500 * KB, jpeg: 700 * KB } },
  { width: 2560, height: 1440, maxBytes: { avif: 600 * KB, webp: 850 * KB, jpeg: 1200 * KB } },
  { width: 3840, height: 2160, maxBytes: { avif: 1100 * KB, webp: 1600 * KB, jpeg: 2200 * KB } },
];

export const PORTRAIT = {
  source: "design/portrait/source.jpg",
  crop: { left: 259, top: 205, width: 440, height: 440 },
  sizes: [
    { side: 96, maxBytes: { avif: 4 * KB, webp: 5 * KB, jpeg: 7 * KB } },
    { side: 192, maxBytes: { avif: 9 * KB, webp: 12 * KB, jpeg: 16 * KB } },
    { side: 384, maxBytes: { avif: 22 * KB, webp: 30 * KB, jpeg: 42 * KB } },
  ],
};

export const OG = { width: 1200, height: 630, cropHeight: 2016, maxBytes: 220 * KB };
export const PLACEHOLDER = { width: 32, height: 18, maxLength: 1500 };
export const APPLE_ICON = {
  source: "src/app/icon.svg",
  output: "src/app/apple-icon.png",
  size: 180,
};

export const FORMATS = ["avif", "webp", "jpeg"];
export const EXTENSIONS = { avif: "avif", webp: "webp", jpeg: "jpg" };

/** Initial quality of each format and the floor below which the build fails (AST-R34). */
export const QUALITY = {
  avif: { start: 50, min: 42 },
  webp: { start: 74, min: 66 },
  jpeg: { start: 78, min: 70 },
};

export const FOLDERS = { scene: "public/scene", portrait: "public/portrait", og: "public/og" };
export const MANIFEST = "src/shared/assets/manifest.generated.ts";
export const PROVENANCE = "design/scene/PROVENANCE.md";
export const TOKENS = "src/styles/tokens.css";

/** Reads `--root <dir>` and `--release` from the command line. */
export function parseOptions(args) {
  const rootIndex = args.indexOf("--root");
  const root = rootIndex === -1 ? process.cwd() : path.resolve(args[rootIndex + 1] ?? ".");
  return { root, release: args.includes("--release") };
}

/** Version of a source file: the first 12 hexadecimal characters of its SHA-256 (AST §3). */
export function versionOf(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 12);
}

export function sceneFileName(width, version, format) {
  return `scene-${width}.${version}.${EXTENSIONS[format]}`;
}

export function portraitFileName(side, version, format) {
  return `portrait-${side}.${version}.${EXTENSIONS[format]}`;
}

export function ogFileName(version) {
  return `og-image.${version}.jpg`;
}

/** Mean brightness of the four corners of a master, as percentages. */
export async function measureCorners(buffer) {
  const { width = 0, height = 0 } = await sharp(buffer).metadata();
  const side = Math.round((CORNER_UNITS * width) / SCENE_SPACE.width);
  const positions = {
    "top left": { left: 0, top: 0 },
    "top right": { left: width - side, top: 0 },
    "bottom left": { left: 0, top: height - side },
    "bottom right": { left: width - side, top: height - side },
  };
  const corners = {};
  for (const [name, position] of Object.entries(positions)) {
    // `stats()` describes the input image, not the result of `extract`, so the pixels of the
    // corner are read and averaged here.
    const { data, info } = await sharp(buffer)
      .extract({ ...position, width: side, height: side })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let luma = 0;
    for (let offset = 0; offset < data.length; offset += info.channels) {
      luma += 0.299 * data[offset] + 0.587 * data[offset + 1] + 0.114 * data[offset + 2];
    }
    corners[name] = (luma / (side * side) / 255) * 100;
  }
  return corners;
}

/** Brightness requirement of each variant: dark corners for the photograph, light for the sketch. */
export function brightnessProblems(variantId, corners) {
  const problems = [];
  for (const [name, value] of Object.entries(corners)) {
    const measured = `${value.toFixed(1)} %`;
    if (variantId === "sketch") {
      if (value < 70)
        problems.push(`the ${name} corner is ${measured} bright; the minimum is 70 % (AST-R51)`);
      continue;
    }
    const limit = name === "top right" ? 12 : 35;
    if (value > limit)
      problems.push(`the ${name} corner is ${measured} bright; the limit is ${limit} % (AST-R14)`);
  }
  return problems;
}

/** Colors that the manifest copies from tokens.css, the only place where they are defined. */
export async function readSiteTheme(root) {
  const css = await readFile(path.join(root, TOKENS), "utf8");
  const themeColor = /^\s*--color-void:\s*(#[0-9a-fA-F]{6});/m.exec(css)?.[1];
  if (themeColor === undefined) throw new Error(`${TOKENS} does not define --color-void`);
  return { themeColor: themeColor.toLowerCase() };
}

/** State of each master in the provenance record: `provisional` or `accepted` (AST-R44). */
export async function readMasterStates(root) {
  const text = await readFile(path.join(root, PROVENANCE), "utf8");
  const states = {};
  for (const section of text.split(/^## /m)) {
    const heading = section.split("\n", 1)[0] ?? "";
    const variant = SCENE_VARIANTS.find(({ id }) => heading.includes(`(\`${id}\`)`));
    const state = /^\|\s*Estado\s*\|\s*`(provisional|accepted)`\s*\|/m.exec(section)?.[1];
    if (variant !== undefined && state !== undefined) states[variant.id] = state;
  }
  for (const { id } of SCENE_VARIANTS) {
    if (states[id] === undefined) {
      throw new Error(`${PROVENANCE} has no section with a state for the "${id}" master`);
    }
  }
  return states;
}

const MANIFEST_EXPORTS = {
  scene: { name: "SCENE_ASSETS", type: "SceneAssets" },
  portrait: { name: "PORTRAIT_ASSET", type: "PortraitAsset" },
  og: { name: "OG_ASSET", type: "OgAsset" },
  theme: { name: "SITE_THEME", type: "SiteTheme" },
};

/** Source of the manifest module. Each constant is written as JSON so that it can be read back. */
export function renderManifest(data) {
  const types = Object.values(MANIFEST_EXPORTS)
    .map(({ type }) => type)
    .sort()
    .join(", ");
  const constants = Object.entries(MANIFEST_EXPORTS).map(
    ([key, { name, type }]) =>
      `export const ${name} = ${JSON.stringify(data[key], null, 2)} as const satisfies ${type};\n`,
  );
  return [
    "// Generated by scripts/build-assets.mjs (pnpm assets:build). Do not edit by hand.",
    `import type { ${types} } from "@/shared/contracts/assets";\n`,
    ...constants,
  ].join("\n");
}

/** Reads the three constants of the manifest module back into plain objects. */
export async function readManifest(root) {
  const text = await readFile(path.join(root, MANIFEST), "utf8");
  const data = {};
  for (const [key, { name, type }] of Object.entries(MANIFEST_EXPORTS)) {
    const start = text.indexOf(`export const ${name} = `);
    const end = text.indexOf(` as const satisfies ${type};`, start);
    if (start === -1 || end === -1) throw new Error(`${MANIFEST} does not export ${name}`);
    data[key] = JSON.parse(text.slice(start + `export const ${name} = `.length, end));
  }
  return data;
}
