import type { SectionProps } from "@/shared/contracts/section";
import { ContentBlock } from "@/shared/ui/content-block";
import { FolderIcon } from "@/shared/ui/icons/folder";
import { StarIcon } from "@/shared/ui/icons/star";

import { projectsEn } from "../content/en";
import { projectsEs } from "../content/es";
import { projectsFacts } from "../content/facts";
import type { ProjectFact, ProjectsText } from "../types";
import { ProjectCard } from "./project-card";

const TEXT: Readonly<Record<SectionProps["locale"], ProjectsText>> = {
  es: projectsEs,
  en: projectsEn,
};

/** Projects: four featured in a column and the rest in a compact grid (SSD-R05, SSD-R08). */
export function ProjectsSection({ locale, idScope }: SectionProps) {
  const text = TEXT[locale];
  const projects: readonly ProjectFact[] = projectsFacts.projects;
  const card = (project: ProjectFact) => (
    <ProjectCard
      key={project.id}
      project={project}
      text={text}
      locale={locale}
      id={`${idScope}projects-${project.id}`}
    />
  );

  return (
    <div className="@container space-y-6">
      <ContentBlock title={text.featuredTitle} icon={<StarIcon />}>
        <div className="divide-ink/20 divide-y [&>article]:py-4 [&>article:first-child]:pt-0 [&>article:last-child]:pb-0">
          {projects.filter((project) => project.featured).map(card)}
        </div>
      </ContentBlock>

      <ContentBlock title={text.moreTitle} icon={<FolderIcon />}>
        <div className="grid grid-cols-1 gap-6 @[640px]:grid-cols-2">
          {projects.filter((project) => !project.featured).map(card)}
        </div>
      </ContentBlock>
    </div>
  );
}
