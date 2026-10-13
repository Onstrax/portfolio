// `pnpm assets:check`: verifies that the masters meet their format and brightness requirements and
// that the derivatives and the manifest in the repository correspond to them (AST-R38, CPU-R10,
// SMP-R21). With `--release` it also refuses a provisional master (AST-R45).
// Usage: node scripts/check-assets.mjs [--release] [--root <dir>]
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import {
  APPLE_ICON,
  brightnessProblems,
  FOLDERS,
  FORMATS,
  MASTER,
  measureCorners,
  OG,
  ogFileName,
  parseOptions,
  PORTRAIT,
  portraitFileName,
  readManifest,
  SCENE_SIZES,
  SCENE_VARIANTS,
  sceneFileName,
  versionOf,
} from "./assets-shared.mjs";

const { root, release } = parseOptions(process.argv.slice(2));
const at = (...parts) => path.join(root, ...parts);
const problems = [];

async function readOrReport(file) {
  try {
    return await readFile(at(file));
  } catch {
    problems.push(`${file} is missing`);
    return null;
  }
}

async function listFolder(folder) {
  try {
    return await readdir(at(folder));
  } catch {
    return [];
  }
}

/** AST-R32: 3840×2160 px, PNG, sRGB, 8 bits per channel, no alpha, 30 MB at most. */
async function checkMasterFormat(file, buffer) {
  const meta = await sharp(buffer).metadata();
  const expected = `${MASTER.width}×${MASTER.height} px, PNG, sRGB, 8 bits per channel, no alpha (AST-R32)`;
  const isValid =
    meta.format === "png" &&
    meta.width === MASTER.width &&
    meta.height === MASTER.height &&
    meta.space === "srgb" &&
    meta.depth === "uchar" &&
    meta.channels === 3 &&
    meta.hasAlpha !== true;
  if (!isValid) problems.push(`${file} must be ${expected}`);
  if (buffer.length > MASTER.maxBytes) {
    problems.push(
      `${file} weighs ${buffer.length} bytes; the maximum is ${MASTER.maxBytes} (AST-R32)`,
    );
  }
}

/** Existence, dimensions, weight and absence of metadata of one published image. */
async function checkDerivative(folder, name, width, height, maxBytes) {
  const file = `${folder}/${name}`;
  const buffer = await readOrReport(file);
  if (buffer === null) return;
  const meta = await sharp(buffer).metadata();
  if (meta.width !== width || meta.height !== height) {
    problems.push(`${file} is ${meta.width}×${meta.height} px; it must be ${width}×${height}`);
  }
  if (buffer.length > maxBytes) {
    problems.push(`${file} weighs ${buffer.length} bytes; the maximum is ${maxBytes}`);
  }
  if (meta.exif !== undefined || meta.xmp !== undefined || meta.iptc !== undefined) {
    problems.push(`${file} carries EXIF, XMP or IPTC metadata (QLT-R47)`);
  }
}

async function checkNoStrangers(folder, expected) {
  for (const name of await listFolder(folder)) {
    if (!expected.has(name)) problems.push(`${folder}/${name} is not listed in the manifest`);
  }
}

function checkSources(label, sources, expectedPaths) {
  const listed = FORMATS.flatMap((format) => (sources?.[format] ?? []).map((source) => source.src));
  if (JSON.stringify([...listed].sort()) !== JSON.stringify([...expectedPaths].sort())) {
    problems.push(
      `the manifest does not list the expected files of ${label}: run pnpm assets:build`,
    );
  }
}

async function checkScene(manifest) {
  const expected = new Set();
  for (const variant of SCENE_VARIANTS) {
    const entry = manifest.scene?.[variant.id];
    const master = await readOrReport(variant.master);
    if (master === null) continue;

    await checkMasterFormat(variant.master, master);
    for (const problem of brightnessProblems(variant.id, await measureCorners(master))) {
      problems.push(`${variant.master}: ${problem}`);
    }

    const version = versionOf(master);
    if (entry?.version !== version) {
      problems.push(
        `${variant.master}: its version (${version}) does not match the manifest (${entry?.version ?? "none"}): run pnpm assets:build`,
      );
    }
    if (release && entry?.provisional !== false) {
      problems.push(`the ${variant.id} master is provisional and cannot be released (AST-R45)`);
    }

    const paths = [];
    for (const size of SCENE_SIZES) {
      for (const format of FORMATS) {
        const name = sceneFileName(size.width, version, format);
        expected.add(name);
        paths.push(`/scene/${name}`);
        await checkDerivative(FOLDERS.scene, name, size.width, size.height, size.maxBytes[format]);
      }
    }
    checkSources(`the ${variant.id} scene`, entry?.sources, paths);
  }
  await checkNoStrangers(FOLDERS.scene, expected);
}

async function checkPortrait(manifest) {
  const source = await readOrReport(PORTRAIT.source);
  if (source === null) return;
  const version = versionOf(source);
  if (manifest.portrait?.version !== version) {
    problems.push(
      `${PORTRAIT.source}: its version (${version}) does not match the manifest (${manifest.portrait?.version ?? "none"}): run pnpm assets:build`,
    );
  }
  const expected = new Set();
  const paths = [];
  for (const size of PORTRAIT.sizes) {
    for (const format of FORMATS) {
      const name = portraitFileName(size.side, version, format);
      expected.add(name);
      paths.push(`/portrait/${name}`);
      await checkDerivative(FOLDERS.portrait, name, size.side, size.side, size.maxBytes[format]);
    }
  }
  checkSources("the portrait", manifest.portrait?.sources, paths);
  await checkNoStrangers(FOLDERS.portrait, expected);
}

async function checkOg(manifest) {
  const version = manifest.scene?.photo?.version ?? "";
  const name = ogFileName(version);
  await checkDerivative(FOLDERS.og, name, OG.width, OG.height, OG.maxBytes);
  await checkNoStrangers(FOLDERS.og, new Set([name]));
  if (manifest.og?.src !== `/og/${name}`) {
    problems.push(`the manifest does not point to ${FOLDERS.og}/${name}: run pnpm assets:build`);
  }
}

async function checkAppleIcon() {
  try {
    await stat(at(APPLE_ICON.source));
    const meta = await sharp(at(APPLE_ICON.output)).metadata();
    if (meta.width !== APPLE_ICON.size || meta.height !== APPLE_ICON.size) {
      problems.push(`${APPLE_ICON.output} must be ${APPLE_ICON.size}×${APPLE_ICON.size} px`);
    }
  } catch {
    problems.push(`${APPLE_ICON.source} or ${APPLE_ICON.output} is missing`);
  }
}

async function main() {
  let manifest;
  try {
    manifest = await readManifest(root);
  } catch (error) {
    problems.push(
      `${error instanceof Error ? error.message : String(error)}: run pnpm assets:build`,
    );
    manifest = {};
  }
  await checkScene(manifest);
  await checkPortrait(manifest);
  await checkOg(manifest);
  await checkAppleIcon();

  if (problems.length > 0) {
    for (const problem of problems) console.error(`assets:check: ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log("assets:check: everything matches the masters");
}

main().catch((error) => {
  console.error(`assets:check: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
