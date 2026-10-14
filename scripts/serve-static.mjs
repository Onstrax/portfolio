// Serves `out/` as static files on port 4173, the way a static host does (SYS §4.9):
// folder URLs resolve to their index.html, unknown URLs get 404.html with status 404, every
// response carries the headers of `out/_headers`, so tests run under the production policy, and
// text is compressed, as the production host does (DEP-R20).
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { promisify } from "node:util";
import { gzip } from "node:zlib";

const ROOT = path.resolve("out");
const PORT = 4173;

const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

/** Extensions whose content is text and shrinks when compressed. Images and fonts already are. */
const COMPRESSIBLE = [".css", ".html", ".js", ".json", ".map", ".svg", ".txt", ".xml"];
const compress = promisify(gzip);
/** Compressed files, by path, with the modification time they were compressed at. */
const compressed = new Map();

/** The file compressed with gzip, computed once and kept until the file changes. */
async function readCompressed(file, modifiedAt) {
  const cached = compressed.get(file);
  if (cached?.modifiedAt === modifiedAt) return cached.body;
  const body = await compress(await readFile(file), { level: 9 });
  compressed.set(file, { modifiedAt, body });
  return body;
}

function acceptsGzip(request) {
  return /\bgzip\b/.test(String(request.headers["accept-encoding"] ?? ""));
}

/** Parses a `_headers` file into a list of `{ route, headers }` rules. */
function parseHeaderRules(text) {
  const rules = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      rules.push({ route: line.trim(), headers: [] });
      continue;
    }
    const separator = line.indexOf(":");
    const rule = rules.at(-1);
    if (rule === undefined || separator === -1) continue;
    rule.headers.push([line.slice(0, separator).trim(), line.slice(separator + 1).trim()]);
  }
  return rules;
}

/**
 * Adapts a header to a server that speaks plain HTTP. `upgrade-insecure-requests` tells the browser
 * to fetch every asset over HTTPS, which this server does not offer: WebKit obeys it on localhost
 * and the page loads nothing. Everything else is served exactly as in production (DEP-R20).
 */
function forPlainHttp(name, value) {
  if (name.toLowerCase() !== "content-security-policy") return value;
  return value
    .split(";")
    .map((directive) => directive.trim())
    .filter((directive) => directive !== "" && directive !== "upgrade-insecure-requests")
    .join("; ");
}

function matchesRoute(route, pathname) {
  if (!route.includes("*")) return route === pathname;
  const [prefix, suffix = ""] = route.split("*");
  return pathname.startsWith(prefix) && pathname.endsWith(suffix);
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

async function loadHeaderRules() {
  try {
    return parseHeaderRules(await readFile(path.join(ROOT, "_headers"), "utf8"));
  } catch {
    return [];
  }
}

const headerRules = await loadHeaderRules();

const server = createServer(async (request, response) => {
  const { pathname: rawPathname } = new URL(request.url ?? "/", `http://localhost:${PORT}`);
  let pathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    pathname = rawPathname;
  }

  const requested = path.join(ROOT, path.normalize(pathname));
  const insideRoot = requested === ROOT || requested.startsWith(ROOT + path.sep);
  let file = pathname.endsWith("/") ? path.join(requested, "index.html") : requested;
  let status = 200;

  if (insideRoot && !pathname.endsWith("/") && (await isFile(path.join(requested, "index.html")))) {
    response.writeHead(308, { Location: `${rawPathname}/` });
    response.end();
    return;
  }
  if (!insideRoot || !(await isFile(file))) {
    file = path.join(ROOT, "404.html");
    status = 404;
  }

  for (const rule of headerRules) {
    if (!matchesRoute(rule.route, pathname)) continue;
    for (const [name, value] of rule.headers) response.setHeader(name, forPlainHttp(name, value));
  }
  response.setHeader(
    "Content-Type",
    CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
  );

  if (!(await isFile(file))) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  // A static host states the size of every file, also in answer to HEAD, which the Next.js
  // router uses to probe a page before prefetching it.
  const { size, mtimeMs } = await stat(file);
  const isCompressed = COMPRESSIBLE.includes(path.extname(file)) && acceptsGzip(request);
  const body = isCompressed ? await readCompressed(file, mtimeMs) : null;
  if (COMPRESSIBLE.includes(path.extname(file))) response.setHeader("Vary", "Accept-Encoding");
  if (body !== null) response.setHeader("Content-Encoding", "gzip");
  response.setHeader("Content-Length", body === null ? size : body.length);
  response.writeHead(status);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  if (body !== null) {
    response.end(body);
    return;
  }
  createReadStream(file).pipe(response);
});

server.listen(PORT, () => {
  console.log(`serve-static: serving ${ROOT} at http://localhost:${PORT}`);
});
