/** Name of the only required environment variable: the public origin of the site (SYS-R35). */
export const SITE_URL_ENV = "NEXT_PUBLIC_SITE_URL";

/**
 * Validates the public origin of the site and returns it.
 * Throws an error that names the variable when it is missing, is not an http or https origin,
 * or carries anything after the origin (a trailing slash, a path or a query).
 */
export function getSiteUrl(env: Readonly<Record<string, string | undefined>>): string {
  const value = env[SITE_URL_ENV];
  if (value === undefined || value === "") {
    throw new Error(
      `${SITE_URL_ENV} is required: set it to the public origin of the site, for example https://example.pages.dev`,
    );
  }
  if (!URL.canParse(value)) {
    throw new Error(
      `${SITE_URL_ENV} must be an absolute http or https origin, received "${value}"`,
    );
  }
  const url = new URL(value);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${SITE_URL_ENV} must use http or https, received "${value}"`);
  }
  if (url.origin !== value) {
    throw new Error(
      `${SITE_URL_ENV} must be an origin without a trailing slash, path or query, received "${value}"`,
    );
  }
  return url.origin;
}
