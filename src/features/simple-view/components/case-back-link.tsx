"use client";

import Link from "next/link";
import { type ReactNode, useSyncExternalStore } from "react";

import { cvPath, sectionPath, VIEW_QUERY } from "@/shared/config/routes";
import type { CaseStudyId } from "@/shared/contracts/ids";
import type { Locale } from "@/shared/contracts/locale";

/** The query of a page does not change while it is shown: there is nothing to subscribe to. */
function subscribeToNothing(): () => void {
  return () => undefined;
}

function readFromSimpleView(): boolean {
  return new URLSearchParams(window.location.search).toString() === VIEW_QUERY;
}

interface CaseBackLinkProps {
  readonly locale: Locale;
  readonly caseStudy: CaseStudyId;
  readonly className: string;
  readonly children: ReactNode;
}

/**
 * The way back from a case study to the projects (SMP-R30). In the HTML it leads to the projects
 * of the scene. When the case was opened from the simple view, its address says so, and the link
 * leads back there instead, to the card of this project, so the visitor never changes view.
 */
export function CaseBackLink({ locale, caseStudy, className, children }: CaseBackLinkProps) {
  const isFromSimpleView = useSyncExternalStore(
    subscribeToNothing,
    readFromSimpleView,
    () => false,
  );
  const href = isFromSimpleView
    ? `${cvPath(locale)}#projects-${caseStudy}`
    : sectionPath(locale, "projects");

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
