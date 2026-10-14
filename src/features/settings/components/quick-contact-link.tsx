import type { QuickContact } from "@/shared/contracts/navigation";
import type { UiDictionary } from "@/shared/i18n/dictionaries/en";
import { DownloadIcon } from "@/shared/ui/icons/download";
import { GithubIcon } from "@/shared/ui/icons/github";
import { LinkedinIcon } from "@/shared/ui/icons/linkedin";
import { MailIcon } from "@/shared/ui/icons/mail";

import { BAR_CONTACT } from "./settings.styles";

interface QuickContactLinkProps {
  readonly contact: QuickContact;
  readonly dictionary: Pick<UiDictionary, "common" | "settings">;
}

/**
 * One direct contact of the fixed bar (SET-R30). The résumé shows a short text; the other three
 * show only their icon, and their accessible name says what they are (VIS-R39, VIS-R40). The
 * external ones also say that they open a new tab, as `ExternalLink` does (SYS-R40).
 */
export function QuickContactLink({ contact, dictionary }: QuickContactLinkProps) {
  const { common, settings } = dictionary;
  const newTab = ` (${common.opensInNewTabHint})`;

  switch (contact.id) {
    case "cv":
      return (
        <a
          href={contact.href}
          download
          type="application/pdf"
          aria-label={common.downloadCvLabel}
          className={BAR_CONTACT}
        >
          <DownloadIcon />
          {settings.cvShortLabel}
        </a>
      );
    case "email":
      return (
        <a href={contact.href} aria-label={settings.emailAriaLabel} className={BAR_CONTACT}>
          <MailIcon size={20} />
        </a>
      );
    case "linkedin":
      return (
        <a href={contact.href} target="_blank" rel="noopener noreferrer" className={BAR_CONTACT}>
          <LinkedinIcon size={20} />
          <span className="sr-only">
            {settings.linkedinAriaLabel}
            {newTab}
          </span>
        </a>
      );
    case "github":
      return (
        <a href={contact.href} target="_blank" rel="noopener noreferrer" className={BAR_CONTACT}>
          <GithubIcon size={20} />
          <span className="sr-only">
            {settings.githubAriaLabel}
            {newTab}
          </span>
        </a>
      );
  }
}
