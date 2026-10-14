// `pnpm test:lighthouse` (TST §4.6): runs Lighthouse CI against the exported site with the desktop
// preset, with the mobile preset, and once more with the mobile preset to measure its Largest
// Contentful Paint under throttling that is really applied (TST-R31). Each run asserts the scores
// and limits of QLT-R29 and QLT-R30, which live in the lighthouserc files. Lighthouse drives the
// Chromium that Playwright installs, so no other browser is needed on the machine or in CI
// (TST-R33).
import { spawn } from "node:child_process";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

const PREVIEW_URL = "http://localhost:4173/";
const CONFIGS = [
  "lighthouserc.desktop.json",
  "lighthouserc.mobile.json",
  "lighthouserc.mobile-lcp.json",
];
const REPORTS_DIR = ".lighthouseci";
const STAGING_DIR = ".lighthouseci.staging";

/** Runs a command and resolves with its exit code. */
function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env });
    child.on("error", reject);
    child.on("exit", (code) => {
      resolve(code ?? 1);
    });
  });
}

async function isServing() {
  try {
    return (await fetch(PREVIEW_URL, { redirect: "manual" })).status < 500;
  } catch {
    return false;
  }
}

/** Starts the preview server, unless one is already serving the site, and waits for it. */
async function startPreview() {
  if (await isServing()) return null;
  const server = spawn("node", ["scripts/serve-static.mjs"], { stdio: "ignore" });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await isServing()) return server;
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
  }
  server.kill();
  throw new Error("test:lighthouse: the preview server did not start. Run `pnpm build` first.");
}

/** Moves the reports that Lighthouse CI left in its folder to a folder of their own. */
async function keepReports(preset) {
  const kept = path.join(STAGING_DIR, preset);
  await mkdir(kept, { recursive: true });
  for (const file of await readdir(REPORTS_DIR)) {
    await rename(path.join(REPORTS_DIR, file), path.join(kept, file));
  }
}

const environment = { ...process.env, CHROME_PATH: chromium.executablePath() };
const server = await startPreview();
let exitCode = 0;
try {
  await rm(STAGING_DIR, { recursive: true, force: true });
  for (const config of CONFIGS) {
    // `collect` empties the reports folder before it writes: each preset is asserted on its own.
    const options = [`--config=${config}`];
    const collected = await run("pnpm", ["exec", "lhci", "collect", ...options], environment);
    const asserted =
      collected === 0 ? await run("pnpm", ["exec", "lhci", "assert", ...options]) : collected;
    if (asserted !== 0) exitCode = asserted;
    await keepReports(path.basename(config, ".json").replace("lighthouserc.", ""));
  }
  // Both sets of reports end up in the folder that CI publishes, one subfolder per preset.
  await rm(REPORTS_DIR, { recursive: true, force: true });
  await rename(STAGING_DIR, REPORTS_DIR);
} finally {
  server?.kill();
}
process.exitCode = exitCode;
