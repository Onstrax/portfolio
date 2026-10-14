import { expect, test } from "@playwright/test";

import {
  cspHash,
  inlineScripts,
  listHtmlDocuments,
  parseHeaderRules,
  parsePolicy,
  readExportedFile,
  routeOfDocument,
} from "../support/export";

const HEADERS_TEXT = readExportedFile("_headers");
const RULES = parseHeaderRules(HEADERS_TEXT);

const GLOBAL_HEADERS: Readonly<Record<string, string>> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

const IMMUTABLE = "public, max-age=31536000, immutable";
const CACHE_RULES: Readonly<Record<string, string>> = {
  "/_next/static/*": IMMUTABLE,
  "/scene/*": IMMUTABLE,
  "/portrait/*": IMMUTABLE,
  "/og/*": IMMUTABLE,
  "/cv/*": "public, max-age=3600",
};

const FIXED_DIRECTIVES: Readonly<Record<string, readonly string[]>> = {
  "default-src": ["'self'"],
  "style-src": ["'self'"],
  "style-src-attr": ["'unsafe-inline'"],
  "img-src": ["'self'", "data:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'", "https://cloudflareinsights.com"],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'none'"],
  "frame-ancestors": ["'none'"],
  "upgrade-insecure-requests": [],
};

const ANALYTICS_ORIGIN = "https://static.cloudflareinsights.com";

function policyOf(file: string): string {
  const policy = RULES.get(routeOfDocument(file))?.get("Content-Security-Policy");
  expect(policy, `policy of ${file}`).toBeDefined();
  return policy ?? "";
}

test("DEP-AC01: _headers stays within the host limits and carries the global and cache rules", () => {
  expect(RULES.size).toBeLessThanOrEqual(100);
  for (const line of HEADERS_TEXT.split("\n")) {
    expect(line.length).toBeLessThanOrEqual(2000);
  }
  expect(Object.fromEntries(RULES.get("/*") ?? [])).toEqual(GLOBAL_HEADERS);
  for (const [route, value] of Object.entries(CACHE_RULES)) {
    expect(Object.fromEntries(RULES.get(route) ?? []), route).toEqual({ "Cache-Control": value });
  }
});

test("DEP-AC02: every document has its own policy with the hashes of its inline scripts", () => {
  const documents = listHtmlDocuments();
  expect(documents.length).toBeGreaterThanOrEqual(20);
  for (const file of documents) {
    const directives = parsePolicy(policyOf(file));
    expect([...directives.keys()].sort(), file).toEqual(
      [...Object.keys(FIXED_DIRECTIVES), "script-src"].sort(),
    );
    for (const [name, values] of Object.entries(FIXED_DIRECTIVES)) {
      expect(directives.get(name), `${file} ${name}`).toEqual(values);
    }
    const expectedHashes = [...new Set(inlineScripts(readExportedFile(file)).map(cspHash))];
    expect(directives.get("script-src"), `${file} script-src`).toEqual([
      "'self'",
      ...expectedHashes,
      ANALYTICS_ORIGIN,
    ]);
  }
});

test("DEP-AC03: no policy allows inline or evaluated scripts", () => {
  for (const file of listHtmlDocuments()) {
    const scriptSources = parsePolicy(policyOf(file)).get("script-src") ?? [];
    expect(scriptSources, file).not.toContain("'unsafe-inline'");
    expect(scriptSources, file).not.toContain("'unsafe-eval'");
    expect(
      scriptSources.filter((source) => source.includes("*")),
      file,
    ).toEqual([]);
  }
});
