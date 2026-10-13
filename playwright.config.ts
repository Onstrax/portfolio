import { defineConfig, devices } from "@playwright/test";

import { VIEWPORTS } from "./e2e/support/viewports";

const BASE_URL = "http://localhost:4173";
const IS_CI = process.env["CI"] !== undefined;

const FLOW_SPECS = /e2e\/[^/]+\.spec\.ts$/;
const EXPORT_SPECS = /e2e\/export\/[^/]+\.spec\.ts$/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [[IS_CI ? "github" : "list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: IS_CI ? "on-first-retry" : "off",
  },
  projects: [
    {
      name: "chromium",
      testMatch: FLOW_SPECS,
      use: { ...devices["Desktop Chrome"], viewport: VIEWPORTS.desktop },
    },
    {
      name: "firefox",
      testMatch: FLOW_SPECS,
      use: { ...devices["Desktop Firefox"], viewport: VIEWPORTS.desktop },
    },
    {
      name: "webkit",
      testMatch: FLOW_SPECS,
      use: { ...devices["Desktop Safari"], viewport: VIEWPORTS.desktop },
    },
    {
      name: "export",
      testMatch: EXPORT_SPECS,
    },
  ],
  webServer: {
    command: "pnpm preview",
    url: BASE_URL,
    reuseExistingServer: !IS_CI,
    timeout: 30_000,
  },
});
