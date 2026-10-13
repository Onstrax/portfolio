import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/shared/config/site";

export const dynamic = "force-static";

/** Every agent may crawl the whole site (SMP-R20). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${getSiteUrl(process.env)}/sitemap.xml`,
  };
}
