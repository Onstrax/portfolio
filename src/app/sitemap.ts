import type { MetadataRoute } from "next";

import { getSitemapEntries } from "@/features/simple-view/server";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapEntries();
}
