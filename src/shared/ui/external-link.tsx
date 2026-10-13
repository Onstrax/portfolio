import type { ReactNode } from "react";

import type { ExternalUrl } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { cn } from "@/shared/lib/cn";

import { ExternalLinkIcon } from "./icons/external-link";
import {
  BUTTON_BASE,
  BUTTON_VARIANTS,
  type ButtonVariant,
  LINK_BASE,
  LINK_SURFACES,
  type Surface,
} from "./link.styles";

interface ExternalLinkProps {
  readonly href: ExternalUrl;
  readonly locale: Locale;
  readonly children: ReactNode;
  readonly surface?: Surface;
  /** Renders the link with the look of a button. */
  readonly button?: ButtonVariant;
  /** Extra words for screen readers, to tell apart links that share their visible text. */
  readonly context?: string;
  /** Decorative icon shown before the text. */
  readonly icon?: ReactNode;
}

/**
 * Link to another origin. Always opens in a new tab, without leaking the opener or the referrer,
 * and says so to screen readers (SYS-R40, I18N §4.3.1).
 */
export function ExternalLink({
  href,
  locale,
  children,
  surface = "light",
  button,
  context,
  icon,
}: ExternalLinkProps) {
  const hint = ` (${getUiDictionary(locale).common.opensInNewTabHint})`;
  const spokenContext = context === undefined ? null : `, ${context}`;
  const appearance =
    button === undefined
      ? cn(LINK_BASE, LINK_SURFACES[surface])
      : cn(BUTTON_BASE, BUTTON_VARIANTS[button]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={appearance}>
      {icon}
      {children}
      {spokenContext !== null && <span className="sr-only">{spokenContext}</span>}
      <ExternalLinkIcon size={16} className="ml-1 align-[-2px]" />
      <span className="sr-only">{hint}</span>
    </a>
  );
}
