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

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** `true` when two boxes share some area. */
export function boxesOverlap(first: Box, second: Box): boolean {
  return (
    first.x < second.x + second.width &&
    second.x < first.x + first.width &&
    first.y < second.y + second.height &&
    second.y < first.y + first.height
  );
}

/** Paths of the JavaScript files that the page requests from now on. */
export function recordScriptRequests(page: Page): Set<string> {
  const requests = new Set<string>();
  page.on("request", (request) => {
    const { pathname } = new URL(request.url());
    if (pathname.endsWith(".js")) requests.add(pathname);
  });
  return requests;
}
