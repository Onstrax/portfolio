// Entry point for server components: everything here reads the section registry (STR-R33).
export { PersonJsonLd } from "./components/person-json-ld";
export { CONTENT_ID, SimpleView } from "./components/simple-view";
export { getPageMetadata } from "./lib/page-metadata";
export type { PageView } from "./lib/page-urls";
export { getSitemapEntries } from "./lib/sitemap";
