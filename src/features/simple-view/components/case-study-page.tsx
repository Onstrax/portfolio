import Link from "next/link";
import type { ReactNode } from "react";

import { SECTIONS } from "@/features/registry";
import { sectionPath } from "@/shared/config/routes";
import { CV_FILES } from "@/shared/config/site";
import type { CaseStudyDecision } from "@/shared/contracts/case-study";
import type { ExternalUrl } from "@/shared/contracts/content";
import type { CaseStudyId } from "@/shared/contracts/ids";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { cn } from "@/shared/lib/cn";
import { BulletList } from "@/shared/ui/bullet-list";
import { ButtonLink } from "@/shared/ui/button-link";
import { Chip } from "@/shared/ui/chip";
import { ExternalLink } from "@/shared/ui/external-link";
import { FactChips } from "@/shared/ui/fact-chips";
import { AwardIcon } from "@/shared/ui/icons/award";
import { ChevronLeftIcon } from "@/shared/ui/icons/chevron-left";
import { CompassIcon } from "@/shared/ui/icons/compass";
import { DownloadIcon } from "@/shared/ui/icons/download";
import { FlagIcon } from "@/shared/ui/icons/flag";
import { UsersIcon } from "@/shared/ui/icons/users";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { LINK_BASE, LINK_SURFACES } from "@/shared/ui/link.styles";
import { RichText } from "@/shared/ui/rich-text";
import { SkipLink } from "@/shared/ui/skip-link";

import { CONTENT_ID } from "./simple-view";

interface CaseStudyPageProps {
  readonly locale: Locale;
  readonly caseStudy: CaseStudyId;
}

const TEXT_LINK = cn(LINK_BASE, LINK_SURFACES.light);
const SECTION_TITLE =
  "mb-6 flex items-center gap-3 font-mono text-2xl leading-8 font-semibold tracking-[0.06em] uppercase";
const BLOCK_TITLE = "font-mono text-sm leading-5 font-semibold tracking-[0.06em] uppercase";

function isExternal(href: string): href is ExternalUrl {
  return href.startsWith("https://");
}

interface CaseSectionProps {
  readonly id: string;
  readonly title: string;
  readonly icon: ReactNode;
  readonly children: ReactNode;
}

/** One of the four blocks of a case study, with its `<h2>` (SMP-R28). */
function CaseSection({ id, title, icon, children }: CaseSectionProps) {
  return (
    <section aria-labelledby={id} className="border-ink/20 mt-12 border-t pt-12">
      <h2 id={id} className={SECTION_TITLE}>
        {icon}
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** The link back to the projects, in the header and in the footer of the page. */
function BackLink({ href, children }: { readonly href: string; readonly children: ReactNode }) {
  return (
    <Link href={href} className={cn(TEXT_LINK, "inline-flex items-center gap-1")}>
      <ChevronLeftIcon />
      {children}
    </Link>
  );
}

/**
 * The page of the case study of a project: problem, role, process and outcome (VSN-R21). Its
 * content lives in the texts of the projects section and the data of the project in its facts,
 * written once (SMP-R25, D-88). It is a plain page that works without JavaScript (SMP-R27).
 */
export function CaseStudyPage({ locale, caseStudy }: CaseStudyPageProps) {
  const { common, simpleView } = getUiDictionary(locale);
  const projects = SECTIONS.projects;
  const text = projects.text[locale];
  const project = projects.facts.projects.find((item) => item.id === caseStudy);
  if (project === undefined) throw new Error(`No project for the case study "${caseStudy}"`);
  const projectText = text.projects[caseStudy];
  const content = text.cases[caseStudy];
  const name = "properName" in project ? project.properName : (projectText.name ?? "");
  const backHref = sectionPath(locale, "projects");
  const decision = ({ options, choice, reason }: CaseStudyDecision) => (
    <dl className="space-y-1">
      {[
        [simpleView.caseOptions, options],
        [simpleView.caseChoice, choice],
        [simpleView.caseReason, reason],
      ].map(([term, description]) => (
        <div key={term}>
          <dt className="font-semibold">{term}</dt>
          <dd>{description}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6">
      <SkipLink label={common.skipToContentLabel} targetId={CONTENT_ID} />

      <header className="flex flex-wrap items-center gap-4 print:hidden">
        <BackLink href={backHref}>{simpleView.caseBackLabel}</BackLink>
        <LanguageSwitcher label={common.languageLabel} focusKey="case-study" surface="light" />
        <ButtonLink href={CV_FILES[locale]} downloadType="application/pdf" icon={<DownloadIcon />}>
          {common.downloadCvLabel}
        </ButtonLink>
      </header>

      <main id={CONTENT_ID} tabIndex={-1} className="mt-8 focus:outline-none">
        <p className={cn(BLOCK_TITLE, "text-ink-muted")}>{simpleView.caseKindTitle}</p>
        <h1 className="mt-2 font-mono text-3xl leading-9 font-semibold">{name}</h1>
        <p className="text-ink-muted mt-2">{projectText.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {projectText.award !== undefined && (
            <Chip variant="recognition" icon={<AwardIcon />}>
              {projectText.award}
            </Chip>
          )}
          <FactChips locale={locale} teamSize={project.teamSize} repository={project.repository} />
          {project.stack.map((technology) => (
            <Chip key={technology}>{technology}</Chip>
          ))}
        </div>
        {project.links.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
            {project.links.map(
              (link) =>
                isExternal(link.href) && (
                  <li key={link.id}>
                    <ExternalLink href={link.href} locale={locale} context={name}>
                      {text.linkLabels[link.id]}
                    </ExternalLink>
                  </li>
                ),
            )}
          </ul>
        )}

        <CaseSection id="case-problem" title={simpleView.caseProblemTitle} icon={<FlagIcon />}>
          {content.problem.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </CaseSection>

        <CaseSection id="case-role" title={simpleView.caseRoleTitle} icon={<UsersIcon />}>
          <p>{content.team}</p>
          <h3 className={BLOCK_TITLE}>{simpleView.caseContributionsTitle}</h3>
          <BulletList items={content.contributions} />
          {content.teamContributions !== undefined && (
            <>
              <h3 className={BLOCK_TITLE}>{simpleView.caseTeamTitle}</h3>
              <p>{content.teamContributions}</p>
            </>
          )}
        </CaseSection>

        <CaseSection id="case-process" title={simpleView.caseProcessTitle} icon={<CompassIcon />}>
          <h3 className={BLOCK_TITLE}>{simpleView.caseDecisionsTitle}</h3>
          <BulletList items={content.decisions.map(decision)} />
          <h3 className={BLOCK_TITLE}>{simpleView.caseChangesTitle}</h3>
          <BulletList items={content.changes} />
        </CaseSection>

        <CaseSection id="case-outcome" title={simpleView.caseOutcomeTitle} icon={<AwardIcon />}>
          <BulletList
            items={content.outcome.map((line, index) => (
              <RichText key={index} line={line} />
            ))}
          />
          <h3 className={BLOCK_TITLE}>{simpleView.caseLearnedTitle}</h3>
          <BulletList items={content.learned} />
        </CaseSection>
      </main>

      <footer className="border-ink/20 mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t pt-6 print:hidden">
        <BackLink href={backHref}>{simpleView.caseBackLabel}</BackLink>
        <a href={`#${CONTENT_ID}`} className={TEXT_LINK}>
          {simpleView.backToTopLabel}
        </a>
      </footer>
    </div>
  );
}
