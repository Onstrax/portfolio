import { sectionPath } from "@/shared/config/routes";
import type { SectionProps } from "@/shared/contracts/section";
import type { ExternalUrl } from "@/shared/contracts/content";
import { BulletList } from "@/shared/ui/bullet-list";
import { Chip } from "@/shared/ui/chip";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { ExternalLink } from "@/shared/ui/external-link";
import { FactChips } from "@/shared/ui/fact-chips";
import { BriefcaseIcon } from "@/shared/ui/icons/briefcase";
import { FlagIcon } from "@/shared/ui/icons/flag";
import { UsersIcon } from "@/shared/ui/icons/users";
import { InternalLink } from "@/shared/ui/internal-link";
import { PeriodText } from "@/shared/ui/period-text";
import { RichText } from "@/shared/ui/rich-text";
import { ITEM_HEADING, ITEM_META } from "@/shared/ui/typography.styles";

import { experienceEn } from "../content/en";
import { experienceEs } from "../content/es";
import { experienceFacts } from "../content/facts";
import type { JobFact } from "../types";

const TEXT = { es: experienceEs, en: experienceEn };

/** Fragment of the dental site inside the projects section (SSD-R06). */
const DENTAL_SITE_FRAGMENT = "#projects-dental-site";
/** The freelance highlight that mentions the dental site carries the link to it (PSU-R06). */
const DENTAL_SITE_HIGHLIGHT = 1;
/** The freelance highlight about the hotel automation carries the link to its code (PSU-R07). */
const AUTOMATION_HIGHLIGHT = 0;

function isExternal(href: string): href is ExternalUrl {
  return href.startsWith("https://");
}

/** Experience: jobs, interpersonal skills and leadership (PSU-R04). */
export function ExperienceSection({ locale }: SectionProps) {
  const text = TEXT[locale];
  const facts = experienceFacts;
  const dentalSiteHref = `${sectionPath(locale, "projects")}${DENTAL_SITE_FRAGMENT}`;

  const linkOf = (job: JobFact, index: number) => {
    if (job.id !== "freelance") return null;
    if (index === DENTAL_SITE_HIGHLIGHT) {
      return <InternalLink href={dentalSiteHref}>{text.dentalSiteLinkLabel}</InternalLink>;
    }
    const repository = job.repositoryLink?.href;
    if (index === AUTOMATION_HIGHLIGHT && repository !== undefined && isExternal(repository)) {
      return (
        <ExternalLink href={repository} locale={locale}>
          {text.automationLinkLabel}
        </ExternalLink>
      );
    }
    return null;
  };
  const highlightsOf = (job: JobFact) =>
    text.jobs[job.id].highlights.map((highlight, index) => {
      const link = linkOf(job, index);
      return (
        <>
          <RichText line={highlight} />
          {link !== null && <> {link}</>}
        </>
      );
    });

  return (
    <div className="space-y-6">
      <ContentBlock title={text.jobsTitle} icon={<BriefcaseIcon />}>
        {facts.jobs.map((job: JobFact) => (
          <article key={job.id} className="space-y-2">
            <h4 className={ITEM_HEADING}>{text.jobs[job.id].role}</h4>
            <p className={ITEM_META}>
              {job.organization !== undefined && <>{job.organization} · </>}
              <PeriodText period={job.period} locale={locale} />
            </p>
            <div className="flex flex-wrap gap-2">
              <FactChips locale={locale} teamSize={job.teamSize} repository={job.repository} />
              {job.stack.map((technology) => (
                <Chip key={technology}>{technology}</Chip>
              ))}
            </div>
            <BulletList items={highlightsOf(job)} />
          </article>
        ))}
      </ContentBlock>

      <ContentBlock title={text.skillsTitle} icon={<UsersIcon />}>
        <ChipList items={text.skills} />
      </ContentBlock>

      <ContentBlock title={text.leadershipTitle} icon={<FlagIcon />}>
        <p>
          {text.leadership}{" "}
          <span className="text-ink-muted text-sm leading-5">
            <PeriodText period={facts.leadershipPeriod} locale={locale} />
          </span>
        </p>
      </ContentBlock>
    </div>
  );
}
