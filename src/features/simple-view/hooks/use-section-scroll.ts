"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { parsePath } from "@/shared/config/routes";

function isSceneMode(): boolean {
  return document.documentElement.dataset["mode"] === "scene";
}

/** Scrolls to the section named by the path, or to the fragment inside it, and focuses its title. */
function scrollToSection(pathname: string): void {
  const parsed = parsePath(pathname);
  if (parsed?.view !== "section" || isSceneMode()) return;

  const fragment = decodeURIComponent(window.location.hash.slice(1));
  const target =
    (fragment === "" ? null : document.getElementById(fragment)) ??
    document.getElementById(parsed.section);
  target?.scrollIntoView();
  document.getElementById(`${parsed.section}-title`)?.focus({ preventScroll: true });
}

/**
 * In simple mode, a section URL shows the simple view scrolled to that section (SYS-R18). It
 * happens when the page loads, when the path changes and whenever the page falls back from the
 * scene to the simple view (SMP-R09).
 */
export function useSectionScroll(): void {
  const pathname = usePathname();

  useEffect(() => {
    scrollToSection(pathname);

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => mutation.oldValue === "scene") && !isSceneMode()) {
        scrollToSection(pathname);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-mode"],
      attributeOldValue: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [pathname]);
}
