import type { Page } from "@playwright/test";

/** `true` when the page is wider than its viewport, that is, when it scrolls sideways. */
export function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
}

/** Paths of the requests for scene image files that the page makes from now on. */
export function recordSceneImageRequests(page: Page): readonly string[] {
  const requests: string[] = [];
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.startsWith("/scene/")) requests.push(pathname);
  });
  return requests;
}
