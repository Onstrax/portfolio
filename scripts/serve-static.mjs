// Serves `out/` as static files on port 4173, the way a static host does (SYS §4.9):
// folder URLs resolve to their index.html, unknown URLs get 404.html with status 404, and every
// response carries the headers of `out/_headers`, so tests run under the production policy (DEP-R20).
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

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
    for (const [name, value] of rule.headers) response.setHeader(name, value);
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
  response.writeHead(status);
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(file).pipe(response);
});

server.listen(PORT, () => {
  console.log(`serve-static: serving ${ROOT} at http://localhost:${PORT}`);
});
