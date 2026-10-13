"use client";

import { useSectionScroll } from "../hooks/use-section-scroll";

/** Renders nothing: it only keeps the simple view scrolled to the section of the URL (SMP-R09). */
export function SectionScroller() {
  useSectionScroll();
  return null;
}
