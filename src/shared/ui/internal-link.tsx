import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

import { LINK_BASE, LINK_SURFACES } from "./link.styles";

interface InternalLinkProps {
  /** A path built with the route helpers, optionally followed by a fragment. */
  readonly href: string;
  readonly children: ReactNode;
}

/** Text link to another page of the site, navigated on the client. */
export function InternalLink({ href, children }: InternalLinkProps) {
  return (
    <Link href={href} className={cn(LINK_BASE, LINK_SURFACES.light)}>
      {children}
    </Link>
  );
}
