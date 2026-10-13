import { expect, test } from "./support/base";

const EXPECTED_HEADERS: Readonly<Record<string, string>> = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "cross-origin-opener-policy": "same-origin",
  "strict-transport-security": "max-age=31536000",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

test("DEP-AC05: the preview server sends the production headers and the page honours its policy", async ({
  page,
}) => {
  const response = await page.goto("/es/");
  const headers = response?.headers() ?? {};

  for (const [name, value] of Object.entries(EXPECTED_HEADERS)) {
    expect(headers[name], name).toBe(value);
  }
  const policy = headers["content-security-policy"] ?? "";
  expect(policy).toContain("default-src 'self'");
  expect(policy).toMatch(/script-src 'self' 'sha256-/);
  expect(policy).not.toContain("'unsafe-inline' ");

  // A policy violation is reported as a console error, which the base test turns into a failure.
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
