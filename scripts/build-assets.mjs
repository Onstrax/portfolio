// `pnpm assets:build`: generates the web derivatives of the two scene masters, of the portrait and
// of the sharing image, the touch icon and the manifest that describes them (AST §4.7, CPU §4.5,
// SMP §4.6). Usage: node scripts/build-assets.mjs [--root <dir>]
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  APPLE_ICON,
  FOLDERS,
  FORMATS,
  MANIFEST,
  MASTER,
  OG,
  ogFileName,
  parseOptions,
  PLACEHOLDER,
  PORTRAIT,
  portraitFileName,
  QUALITY,
  readMasterStates,
  readSiteTheme,
  renderManifest,
  SAFE_AREA,
  SCENE_SIZES,
  SCENE_SPACE,
  SCENE_VARIANTS,
  sceneFileName,
  versionOf,
} from "./assets-shared.mjs";

const { root } = parseOptions(process.argv.slice(2));
const at = (...parts) => path.join(root, ...parts);

function encode(pipeline, format, quality) {
  if (format === "avif") return pipeline.avif({ quality, effort: 4 }).toBuffer();
  if (format === "webp") return pipeline.webp({ quality, effort: 4 }).toBuffer();
  return pipeline.jpeg({ quality, progressive: true, mozjpeg: true }).toBuffer();
}

/**
 * Encodes with the initial quality and lowers it one step at a time until the file fits its
 * maximum weight. Fails if the minimum quality is still too heavy (AST-R34).
 */
async function encodeWithinBudget(createPipeline, format, maxBytes, label) {
  let size = 0;
  for (let quality = QUALITY[format].start; quality >= QUALITY[format].min; quality -= 1) {
    const buffer = await encode(createPipeline(), format, quality);
    size = buffer.length;
    if (size <= maxBytes) return { buffer, quality };
  }
  throw new Error(
    `${label} weighs ${size} bytes at the minimum quality (${QUALITY[format].min}); the maximum is ${maxBytes}`,
  );
}

/** Writes a set of files into a folder and removes whatever else was there. */
async function writeFolder(folder, files) {
  await mkdir(at(folder), { recursive: true });
  for (const stale of await readdir(at(folder))) {
    if (!files.has(stale)) await rm(at(folder, stale));
  }
  for (const [name, buffer] of files) await writeFile(at(folder, name), buffer);
}

function report(name, buffer, quality) {
  console.log(`  ${name}  ${(buffer.length / 1000).toFixed(1)} kB  quality ${quality}`);
}

function toHex(value) {
  return Math.round(value).toString(16).padStart(2, "0");
}

async function buildPlaceholder(master) {
  const preview = await sharp(master)
    .resize(PLACEHOLDER.width, PLACEHOLDER.height)
    .blur(1)
    .webp({ quality: 50 })
    .toBuffer();
  const dataUrl = `data:image/webp;base64,${preview.toString("base64")}`;
  if (dataUrl.length > PLACEHOLDER.maxLength) {
    throw new Error(
      `the placeholder has ${dataUrl.length} characters; the maximum is ${PLACEHOLDER.maxLength}`,
    );
  }
  const { channels } = await sharp(master).stats();
  const color = `#${channels
    .slice(0, 3)
    .map((channel) => toHex(channel.mean))
    .join("")}`;
  return { color, dataUrl };
}

async function buildScene(variant, state, files) {
  const master = await readFile(at(variant.master));
  const version = versionOf(master);
  const sources = { avif: [], webp: [], jpeg: [] };
  console.log(`${variant.master} (${version}, ${state})`);
  for (const size of SCENE_SIZES) {
    for (const format of FORMATS) {
      const name = sceneFileName(size.width, version, format);
      const { buffer, quality } = await encodeWithinBudget(
        () => sharp(master).resize(size.width, size.height, { kernel: "lanczos3" }),
        format,
        size.maxBytes[format],
        name,
      );
      files.set(name, buffer);
      sources[format].push({ width: size.width, src: `/scene/${name}` });
      report(name, buffer, quality);
    }
  }
  return {
    master,
    entry: {
      version,
      provisional: state === "provisional",
      width: MASTER.width,
      height: MASTER.height,
      sceneSpace: SCENE_SPACE,
      safeArea: SAFE_AREA,
      sources,
      placeholder: await buildPlaceholder(master),
    },
  };
}

async function buildPortrait() {
  const source = await readFile(at(PORTRAIT.source));
  const version = versionOf(source);
  const files = new Map();
  const sources = { avif: [], webp: [], jpeg: [] };
  console.log(`${PORTRAIT.source} (${version})`);
  for (const size of PORTRAIT.sizes) {
    for (const format of FORMATS) {
      const name = portraitFileName(size.side, version, format);
      const { buffer, quality } = await encodeWithinBudget(
        () =>
          sharp(source).extract(PORTRAIT.crop).resize(size.side, size.side, { kernel: "lanczos3" }),
        format,
        size.maxBytes[format],
        name,
      );
      files.set(name, buffer);
      sources[format].push({ width: size.side, src: `/portrait/${name}` });
      report(name, buffer, quality);
    }
  }
  await writeFolder(FOLDERS.portrait, files);
  return { version, sources };
}

/** Sharing image: the centered horizontal band of the photograph, without text (SMP-R21). */
async function buildOg(master, version) {
  const name = ogFileName(version);
  const top = (MASTER.height - OG.cropHeight) / 2;
  const { buffer, quality } = await encodeWithinBudget(
    () =>
      sharp(master)
        .extract({ left: 0, top, width: MASTER.width, height: OG.cropHeight })
        .resize(OG.width, OG.height, { kernel: "lanczos3" }),
    "jpeg",
    OG.maxBytes,
    name,
  );
  await writeFolder(FOLDERS.og, new Map([[name, buffer]]));
  report(name, buffer, quality);
  return { src: `/og/${name}`, width: OG.width, height: OG.height };
}

async function buildAppleIcon() {
  const icon = await readFile(at(APPLE_ICON.source));
  const buffer = await sharp(icon, { density: 72 * 8 })
    .resize(APPLE_ICON.size, APPLE_ICON.size)
    .png()
    .toBuffer();
  await writeFile(at(APPLE_ICON.output), buffer);
  console.log(`${APPLE_ICON.output}  ${(buffer.length / 1000).toFixed(1)} kB`);
}

async function main() {
  const states = await readMasterStates(root);
  const sceneFiles = new Map();
  const scene = {};
  let photoMaster;
  for (const variant of SCENE_VARIANTS) {
    const { master, entry } = await buildScene(variant, states[variant.id], sceneFiles);
    scene[variant.id] = entry;
    if (variant.id === "photo") photoMaster = master;
  }
  await writeFolder(FOLDERS.scene, sceneFiles);

  const portrait = await buildPortrait();
  const og = await buildOg(photoMaster, scene.photo.version);
  await buildAppleIcon();

  await mkdir(path.dirname(at(MANIFEST)), { recursive: true });
  const theme = await readSiteTheme(root);
  await writeFile(at(MANIFEST), renderManifest({ scene, portrait, og, theme }), "utf8");
  console.log(`assets:build: wrote ${MANIFEST}`);
}

main().catch((error) => {
  console.error(`assets:build: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
