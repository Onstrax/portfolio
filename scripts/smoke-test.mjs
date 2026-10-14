// Checks a published site over HTTP (DEP-R16): its pages answer, the home declares a canonical
// URL of that same site, an unknown path answers 404 and the security headers are served.
// Usage: node scripts/smoke-test.mjs <base URL> [--wait <seconds>]
// With `--wait`, the checks are repeated until they all pass or that time runs out: a host can
// take some seconds to serve a site that was just published.

const PAGES = ["/", "/es/", "/en/", "/es/projects/", "/en/cv/", "/es/projects/thesis/"];
const FILES = ["/robots.txt", "/sitemap.xml"];
const UNKNOWN_PATH = "/this-page-does-not-exist/";
const HOME = "/es/";
const SECURITY_HEADERS = ["Content-Security-Policy", "X-Content-Type-Options"];
const RETRY_INTERVAL_MS = 5000;

/** Reads the base URL, without a trailing slash, and the seconds of `--wait`. */
function parseOptions(args) {
  const waitIndex = args.indexOf("--wait");
  const positional = args.filter(
    (arg, index) => !arg.startsWith("--") && (waitIndex === -1 || index !== waitIndex + 1),
  );
  const seconds = waitIndex === -1 ? 0 : Number(args[waitIndex + 1]);
  return {
    base: positional[0]?.replace(/\/+$/, ""),
    waitMs: Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 0,
  };
}

/** The `href` of the canonical link of an HTML document, if it has one. */
function findCanonical(html) {
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/\brel=["']canonical["']/i.test(tag)) continue;
    return /\bhref=["']([^"']*)["']/i.exec(tag)?.[1];
  }
  return undefined;
}

/** Runs every check once and returns what failed, one line each. */
async function findProblems(base) {
  const problems = [];
  // Redirects are not followed: a page that moved does not answer 200.
  const request = async (pathname) => {
    try {
      return await fetch(`${base}${pathname}`, { redirect: "manual" });
    } catch (error) {
      const reason = error?.cause?.code ?? error?.cause?.message ?? String(error);
      problems.push(`${pathname} could not be requested: ${reason}`);
      return null;
    }
  };

  for (const pathname of [...PAGES, ...FILES]) {
    const response = await request(pathname);
    if (response === null) continue;
    if (response.status !== 200) {
      problems.push(`${pathname} answered ${String(response.status)} instead of 200`);
    }
    if (pathname !== HOME) continue;
    for (const header of SECURITY_HEADERS) {
      if (!response.headers.has(header)) problems.push(`${pathname} lacks the ${header} header`);
    }
    const canonical = findCanonical(await response.text());
    if (canonical === undefined) {
      problems.push(`${pathname} declares no canonical URL`);
    } else if (!canonical.startsWith(`${base}/`)) {
      problems.push(`${pathname} declares the canonical URL ${canonical}, outside ${base}`);
    }
  }

  const unknown = await request(UNKNOWN_PATH);
  if (unknown !== null && unknown.status !== 404) {
    problems.push(`${UNKNOWN_PATH} answered ${String(unknown.status)} instead of 404`);
  }
  return problems;
}

async function main() {
  const { base, waitMs } = parseOptions(process.argv.slice(2));
  if (base === undefined || !/^https?:\/\//.test(base)) {
    console.error("smoke-test: usage: node scripts/smoke-test.mjs <base URL> [--wait <seconds>]");
    process.exitCode = 2;
    return;
  }

  const deadline = Date.now() + waitMs;
  let problems = await findProblems(base);
  while (problems.length > 0 && Date.now() + RETRY_INTERVAL_MS <= deadline) {
    await new Promise((resolve) => {
      setTimeout(resolve, RETRY_INTERVAL_MS);
    });
    problems = await findProblems(base);
  }

  if (problems.length > 0) {
    for (const problem of problems) console.error(`smoke-test: ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`smoke-test: ${base} passed every check`);
}

main().catch((error) => {
  console.error(`smoke-test: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
