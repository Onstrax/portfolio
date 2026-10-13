import type { ReactNode } from "react";

import { CV_FILES } from "@/shared/config/site";
import { type Locale, LOCALES } from "@/shared/contracts/locale";
import type { SectionProps } from "@/shared/contracts/section";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui/button-link";
import { ContentBlock } from "@/shared/ui/content-block";
import { CopyButton } from "@/shared/ui/copy-button";
import { ExternalLink } from "@/shared/ui/external-link";
import { DownloadIcon } from "@/shared/ui/icons/download";
import { FileTextIcon } from "@/shared/ui/icons/file-text";
import { GithubIcon } from "@/shared/ui/icons/github";
import { LinkedinIcon } from "@/shared/ui/icons/linkedin";
import { MailIcon } from "@/shared/ui/icons/mail";
import { PlugIcon } from "@/shared/ui/icons/plug";
import { WhatsappIcon } from "@/shared/ui/icons/whatsapp";
import { LINK_BASE, LINK_SURFACES } from "@/shared/ui/link.styles";

import { contactEn } from "../content/en";
import { contactEs } from "../content/es";
import { contactFacts } from "../content/facts";
import type { ContactFact, ContactId } from "../types";

const TEXT = { es: contactEs, en: contactEn };

const CHANNEL_ICONS: Readonly<Record<ContactId, ReactNode>> = {
  email: <MailIcon />,
  whatsapp: <WhatsappIcon />,
  linkedin: <LinkedinIcon />,
  github: <GithubIcon />,
};

function isExternal(href: string): href is `https://${string}` {
  return href.startsWith("https://");
}

/** Contact: direct channels and the résumé in both languages (IO-R09). */
export function ContactSection({ locale }: SectionProps) {
  const text = TEXT[locale];
  const { common } = getUiDictionary(locale);
  // The résumé in the language of the page goes first (IO-R12).
  const cvLocales: readonly Locale[] = [locale, ...LOCALES.filter((other) => other !== locale)];

  const channelLink = (channel: ContactFact) =>
    isExternal(channel.href) ? (
      <ExternalLink href={channel.href} locale={locale}>
        {channel.display}
      </ExternalLink>
    ) : (
      <a href={channel.href} className={cn(LINK_BASE, LINK_SURFACES.light)}>
        {channel.display}
      </a>
    );

  return (
    <div className="space-y-6">
      <p>{text.intro}</p>

      <ContentBlock title={text.channelsTitle} icon={<PlugIcon />}>
        <dl className="space-y-3">
          {contactFacts.channels.map((channel: ContactFact) => (
            <div key={channel.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <dt className="flex min-w-28 items-center gap-2 font-semibold">
                {CHANNEL_ICONS[channel.id]}
                {text.channelLabels[channel.id]}
              </dt>
              <dd className="flex min-w-0 flex-wrap items-center gap-3">
                {channelLink(channel)}
                {channel.id === "email" && (
                  <CopyButton
                    text={contactFacts.email}
                    label={common.copyLabel}
                    accessibleName={text.copyEmailAriaLabel}
                    copiedLabel={common.copiedAnnouncement}
                  />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </ContentBlock>

      <ContentBlock title={text.cvTitle} icon={<FileTextIcon />}>
        <ul className="flex flex-wrap gap-3">
          {cvLocales.map((cvLocale, index) => (
            <li key={cvLocale}>
              <ButtonLink
                href={CV_FILES[cvLocale]}
                variant={index === 0 ? "primary" : "secondary"}
                downloadType="application/pdf"
                icon={<DownloadIcon />}
              >
                {text.cvLabels[cvLocale]}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </ContentBlock>
    </div>
  );
}
