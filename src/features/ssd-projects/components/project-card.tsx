import Link from "next/link";

import { caseStudyPath } from "@/shared/config/routes";
import type { ExternalUrl } from "@/shared/contracts/content";
import { isCaseStudyId } from "@/shared/contracts/ids";
import type { Locale } from "@/shared/contracts/locale";
import { BulletList } from "@/shared/ui/bullet-list";
import { Chip } from "@/shared/ui/chip";
import { ExternalLink } from "@/shared/ui/external-link";
import { cn } from "@/shared/lib/cn";
import { FactChips } from "@/shared/ui/fact-chips";
import { AwardIcon } from "@/shared/ui/icons/award";
import { ChevronRightIcon } from "@/shared/ui/icons/chevron-right";
import { BUTTON_BASE, BUTTON_VARIANTS } from "@/shared/ui/link.styles";
import { RichText } from "@/shared/ui/rich-text";

import { projectName } from "../lib/project-name";
import type { ProjectFact, ProjectsText } from "../types";

interface ProjectCardProps {
  readonly project: ProjectFact;
  readonly text: ProjectsText;
  readonly locale: Locale;
  /** `id` of the article: the scope of the section followed by the local identifier (TSC-R31). */
  readonly id: string;
}

function isExternal(href: string): href is ExternalUrl {
  return href.startsWith("https://");
}

/** One project, with the same fields whether it is featured or compact (SSD-R07, SSD-R08). */
export function ProjectCard({ project, text, locale, id }: ProjectCardProps) {
  const { tagline, highlights, award, note } = text.projects[project.id];
  const name = projectName(project, text);

  return (
    <article id={id} className="scroll-mt-4 space-y-2">
      <h4 className="font-semibold">{name}</h4>
      <p className="text-ink-muted text-sm leading-5">{tagline}</p>
      <div className="flex flex-wrap gap-2">
        {award !== undefined && (
          <Chip variant="recognition" icon={<AwardIcon />}>
            {award}
          </Chip>
        )}
        <FactChips locale={locale} teamSize={project.teamSize} repository={project.repository} />
        {project.stack.map((technology) => (
          <Chip key={technology}>{technology}</Chip>
        ))}
      </div>
      <BulletList
        items={highlights.map((line, index) => (
          <RichText key={index} line={line} />
        ))}
      />
      {note !== undefined && <p className="text-ink-muted text-sm leading-5">{note}</p>}
      {project.links.length > 0 && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
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
      {isCaseStudyId(project.id) && (
        <p>
          <Link
            href={caseStudyPath(locale, project.id)}
            className={cn(BUTTON_BASE, BUTTON_VARIANTS.secondary)}
          >
            {text.caseLinkLabel}
            <ChevronRightIcon />
          </Link>
        </p>
      )}
    </article>
  );
}
