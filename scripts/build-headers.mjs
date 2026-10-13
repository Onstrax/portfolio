// Writes `<outDir>/_headers`, the header rules Cloudflare Pages applies when serving the site
// (DEP §4.5 and §4.6), after joining the data scripts of Next.js in every document (DEP-R32).
// Runs at the end of `pnpm build`. Usage: node scripts/build-headers.mjs [outDir]
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_RULES = 100;
const MAX_LINE_LENGTH = 2000;
const ANALYTICS_ORIGIN = "https://static.cloudflareinsights.com";

const GLOBAL_HEADERS = [
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["X-Frame-Options", "DENY"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
  ["Strict-Transport-Security", "max-age=31536000"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()"],
];

const IMMUTABLE = "public, max-age=31536000, immutable";
const CACHE_RULES = [
  ["/_next/static/*", IMMUTABLE],
  ["/scene/*", IMMUTABLE],
  ["/portrait/*", IMMUTABLE],
  ["/og/*", IMMUTABLE],
  ["/cv/*", "public, max-age=3600"],
];

const EXECUTABLE_TYPES = new Set(["", "module", "text/javascript", "application/javascript"]);
const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

async function findHtmlFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(full, base)));
    } else if (entry.name.endsWith(".html")) {
      files.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return files;
}

/** URL path under which a static host serves the document. */
function routeOf(file) {
  if (file === "index.html") return "/";
  if (file.endsWith("/index.html")) return `/${file.slice(0, -"index.html".length)}`;
  return `/${file}`;
}

function isExecutableInline(attributes, content) {
  if (/\ssrc\s*=/i.test(attributes) || content.length === 0) return false;
  const type = /\stype\s*=\s*["']?([^"'\s>]*)/i.exec(attributes)?.[1]?.toLowerCase() ?? "";
  return EXECUTABLE_TYPES.has(type);
}

/** Next.js delivers the data of a page in many small inline scripts that push to this array. */
const NEXT_DATA_SCRIPT = /^\(?self\.__next_f\b/;

/**
 * Joins the data scripts of Next.js into a single script, in their original order and where the
 * first one was. A page with real content carries dozens of them, and one hash per script would
 * not fit in the 2000 characters of a `_headers` line (DEP-R32). Other inline scripts stay as
 * they are.
 */
function mergeNextDataScripts(html) {
  const chunks = [];
  for (const [, attributes, content] of html.matchAll(SCRIPT_PATTERN)) {
    if (isExecutableInline(attributes, content) && NEXT_DATA_SCRIPT.test(content)) {
      chunks.push(content);
    }
  }
  if (chunks.length < 2) return html;

  let isFirst = true;
  return html.replace(SCRIPT_PATTERN, (element, attributes, content) => {
    if (!isExecutableInline(attributes, content) || !NEXT_DATA_SCRIPT.test(content)) return element;
    if (!isFirst) return "";
    isFirst = false;
    return `<script>${chunks.join(";")}</script>`;
  });
}

/** SHA-256 hashes of the inline scripts that the browser executes, in document order. */
function inlineScriptHashes(html) {
  const hashes = [];
  for (const [, attributes, content] of html.matchAll(SCRIPT_PATTERN)) {
    if (!isExecutableInline(attributes, content)) continue;
    const hash = `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
    if (!hashes.includes(hash)) hashes.push(hash);
  }
  return hashes;
}

function contentSecurityPolicy(hashes) {
  return [
    "default-src 'self'",
    ["script-src 'self'", ...hashes, ANALYTICS_ORIGIN].join(" "),
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

async function main() {
  const outDir = path.resolve(process.argv[2] ?? "out");
  const rules = [
    { route: "/*", headers: GLOBAL_HEADERS },
    ...CACHE_RULES.map(([route, value]) => ({ route, headers: [["Cache-Control", value]] })),
  ];

  for (const file of await findHtmlFiles(outDir)) {
    const original = await readFile(path.join(outDir, file), "utf8");
    const html = mergeNextDataScripts(original);
    if (html !== original) await writeFile(path.join(outDir, file), html, "utf8");
    const policy = contentSecurityPolicy(inlineScriptHashes(html));
    rules.push({ route: routeOf(file), headers: [["Content-Security-Policy", policy]] });
  }

  if (rules.length > MAX_RULES) {
    throw new Error(
      `_headers would have ${rules.length} rules; the limit is ${MAX_RULES} (DEP-R23)`,
    );
  }
  const lines = [];
  for (const { route, headers } of rules) {
    lines.push(route);
    for (const [name, value] of headers) {
      const line = `  ${name}: ${value}`;
      if (line.length > MAX_LINE_LENGTH) {
        throw new Error(
          `The ${name} line for ${route} has ${line.length} characters; the limit is ${MAX_LINE_LENGTH} (DEP-R23)`,
        );
      }
      lines.push(line);
    }
    lines.push("");
  }

  await writeFile(path.join(outDir, "_headers"), lines.join("\n"), "utf8");
  console.log(`build-headers: wrote ${rules.length} rules to ${path.join(outDir, "_headers")}`);
}

main().catch((error) => {
  console.error(`build-headers: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
