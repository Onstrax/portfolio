import { sectionPath } from "@/shared/config/routes";
import type { SectionProps } from "@/shared/contracts/section";
import { BulletList } from "@/shared/ui/bullet-list";
import { Chip } from "@/shared/ui/chip";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { FactChips } from "@/shared/ui/fact-chips";
import { BriefcaseIcon } from "@/shared/ui/icons/briefcase";
import { FlagIcon } from "@/shared/ui/icons/flag";
import { UsersIcon } from "@/shared/ui/icons/users";
import { InternalLink } from "@/shared/ui/internal-link";
import { PeriodText } from "@/shared/ui/period-text";

import { experienceEn } from "../content/en";
import { experienceEs } from "../content/es";
import { experienceFacts } from "../content/facts";
import type { JobFact } from "../types";

const TEXT = { es: experienceEs, en: experienceEn };

/** Fragment of the dental site inside the projects section (SSD-R06). */
const DENTAL_SITE_FRAGMENT = "#projects-dental-site";
/** The freelance highlight that mentions the dental site carries the link to it (PSU-R06). */
const DENTAL_SITE_HIGHLIGHT = 1;

/** Experience: jobs, interpersonal skills and leadership (PSU-R04). */
export function ExperienceSection({ locale }: SectionProps) {
  const text = TEXT[locale];
  const facts = experienceFacts;
  const dentalSiteHref = `${sectionPath(locale, "projects")}${DENTAL_SITE_FRAGMENT}`;

  const highlightsOf = (job: JobFact) =>
    text.jobs[job.id].highlights.map((highlight, index) =>
      job.id === "freelance" && index === DENTAL_SITE_HIGHLIGHT ? (
        <>
          {highlight} <InternalLink href={dentalSiteHref}>{text.dentalSiteLinkLabel}</InternalLink>
        </>
      ) : (
        highlight
      ),
    );

  return (
    <div className="space-y-6">
      <ContentBlock title={text.jobsTitle} icon={<BriefcaseIcon />}>
        {facts.jobs.map((job: JobFact) => (
          <article key={job.id} className="space-y-2">
            <h4 className="font-semibold">{text.jobs[job.id].role}</h4>
            <p className="text-ink-muted text-sm leading-5">
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
