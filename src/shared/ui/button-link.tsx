import type { ReactNode } from "react";

import type { SitePath } from "@/shared/contracts/content";
import { cn } from "@/shared/lib/cn";

import { BUTTON_BASE, BUTTON_VARIANTS, type ButtonVariant } from "./link.styles";

interface ButtonLinkProps {
  /** A file of the site, or an anchor of the current page. */
  readonly href: SitePath | `#${string}`;
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  /** Decorative icon shown before the text. */
  readonly icon?: ReactNode;
  /** Media type of the file, when the link downloads one. */
  readonly downloadType?: string;
}

/** Link with the look of a button, for downloads and in-page anchors (VIS §4.6). */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  icon,
  downloadType,
}: ButtonLinkProps) {
  const download = downloadType === undefined ? {} : { download: true, type: downloadType };
  return (
    <a href={href} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant])} {...download}>
      {icon}
      {children}
    </a>
  );
}
