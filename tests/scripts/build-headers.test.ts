import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = fileURLToPath(new URL("../../scripts/build-headers.mjs", import.meta.url));
const run = promisify(execFile);

const FIRST_SCRIPT = 'document.documentElement.dataset.mode = "simple";';
const SECOND_SCRIPT = "self.__next_f = self.__next_f || [];";
const STRUCTURED_DATA = '{"@type":"Person","name":"Sample"}';

function hashOf(content: string): string {
  return `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
}

function page(...scripts: readonly string[]): string {
  return `<!DOCTYPE html><html lang="en"><head>${scripts.join("")}</head><body></body></html>`;
}

const folders: string[] = [];

async function exportedSite(files: Readonly<Record<string, string>>): Promise<string> {
  const folder = await mkdtemp(path.join(tmpdir(), "build-headers-"));
  folders.push(folder);
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(folder, name)), { recursive: true });
    await writeFile(path.join(folder, name), content, "utf8");
  }
  return folder;
}

afterEach(async () => {
  await Promise.all(folders.splice(0).map((folder) => rm(folder, { recursive: true })));
});

describe("build-headers.mjs", () => {
  it("DEP-AC04: writes the hashes of the inline scripts and ignores structured data", async () => {
    const folder = await exportedSite({
      "es/index.html": page(
        `<script>${FIRST_SCRIPT}</script>`,
        '<script src="/_next/static/app.js" async=""></script>',
        `<script type="application/ld+json">${STRUCTURED_DATA}</script>`,
        `<script>${SECOND_SCRIPT}</script>`,
      ),
      "index.html": page(),
    });

    await run("node", [SCRIPT, folder]);
    const headers = await readFile(path.join(folder, "_headers"), "utf8");

    expect(headers).toContain(
      `/es/\n  Content-Security-Policy: default-src 'self'; script-src 'self' ${hashOf(FIRST_SCRIPT)} ${hashOf(SECOND_SCRIPT)} https://static.cloudflareinsights.com; style-src 'self';`,
    );
    expect(headers).not.toContain(hashOf(STRUCTURED_DATA));
    expect(headers).toContain(
      "/\n  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com;",
    );
  });

  it("DEP-AC04: fails when the policy of a document would exceed 2000 characters", async () => {
    const scripts = Array.from(
      { length: 40 },
      (_, index) => `<script>window.value${String(index)} = ${String(index)};</script>`,
    );
    const folder = await exportedSite({ "en/projects/index.html": page(...scripts) });

    const failure: unknown = await run("node", [SCRIPT, folder]).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(Error);
    expect(failure).toMatchObject({ code: 1 });
    expect(failure).toMatchObject({ stderr: expect.stringContaining("/en/projects/") as unknown });
    expect(failure).toMatchObject({ stderr: expect.stringContaining("2000") as unknown });
  });
});
