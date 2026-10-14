import { execFile } from "node:child_process";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = fileURLToPath(new URL("../../scripts/smoke-test.mjs", import.meta.url));
const run = promisify(execFile);

interface Answer {
  readonly status: number;
  readonly body?: string;
}

interface SampleSite {
  /** Paths that answer something other than what a healthy site answers. */
  readonly answers?: Readonly<Record<string, Answer>>;
  readonly hasPolicy?: boolean;
  /** Origin that the home declares as canonical. By default, the one of the server. */
  readonly canonicalOrigin?: string;
}

const PATHS = ["/", "/es/", "/en/", "/es/projects/", "/en/cv/", "/robots.txt", "/sitemap.xml"];
const servers: Server[] = [];

/** Starts a server that answers as the published site does, except for what `site` changes. */
async function sampleServer(site: SampleSite = {}): Promise<string> {
  const server = createServer((request, response) => {
    const origin = `http://${request.headers.host ?? ""}`;
    const pathname = request.url ?? "/";
    const canonical = `${site.canonicalOrigin ?? origin}${pathname}`;
    const answer = site.answers?.[pathname] ?? {
      status: PATHS.includes(pathname) ? 200 : 404,
      body: `<html><head><link rel="canonical" href="${canonical}"/></head><body></body></html>`,
    };
    response.setHeader("X-Content-Type-Options", "nosniff");
    if (site.hasPolicy !== false) {
      response.setHeader("Content-Security-Policy", "default-src 'self'");
    }
    response.writeHead(answer.status, { "Content-Type": "text/html; charset=utf-8" });
    response.end(answer.body ?? "");
  });
  servers.push(server);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  return `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
}

/** Runs the script and returns its exit code with what it wrote. */
async function smokeTest(...args: readonly string[]): Promise<{ code: number; output: string }> {
  try {
    const { stdout, stderr } = await run("node", [SCRIPT, ...args]);
    return { code: 0, output: stdout + stderr };
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string };
    return { code: failure.code ?? -1, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}` };
  }
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => {
            resolve();
          });
        }),
    ),
  );
});

describe("smoke-test.mjs", () => {
  it("DEP-AC07: ends well against a site that passes every check", async () => {
    const base = await sampleServer();

    const { code, output } = await smokeTest(`${base}/`);

    expect(output).toContain("passed every check");
    expect(code).toBe(0);
  });

  it("DEP-AC07: fails when the security policy header is missing", async () => {
    const base = await sampleServer({ hasPolicy: false });

    const { code, output } = await smokeTest(base);

    expect(code).toBe(1);
    expect(output).toContain("/es/ lacks the Content-Security-Policy header");
  });

  it("DEP-AC07: fails when a page answers 500", async () => {
    const base = await sampleServer({ answers: { "/en/cv/": { status: 500 } } });

    const { code, output } = await smokeTest(base);

    expect(code).toBe(1);
    expect(output).toContain("/en/cv/ answered 500 instead of 200");
  });

  it("DEP-AC07: fails when an unknown path answers 200", async () => {
    const base = await sampleServer({
      answers: { "/this-page-does-not-exist/": { status: 200 } },
    });

    const { code, output } = await smokeTest(base);

    expect(code).toBe(1);
    expect(output).toContain("/this-page-does-not-exist/ answered 200 instead of 404");
  });

  it("fails when the home declares a canonical URL of another site", async () => {
    const base = await sampleServer({ canonicalOrigin: "http://localhost:4173" });

    const { code, output } = await smokeTest(base);

    expect(code).toBe(1);
    expect(output).toContain("declares the canonical URL http://localhost:4173/es/");
  });

  it("asks for a base URL when none is given", async () => {
    const { code, output } = await smokeTest();

    expect(code).toBe(2);
    expect(output).toContain("usage:");
  });
});
