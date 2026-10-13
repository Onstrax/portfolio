import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { getSiteUrl } from "./src/shared/config/site";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    // Fails the production build when the public origin is missing or malformed (SYS-R35).
    getSiteUrl(process.env);
  }
  return nextConfig;
}
