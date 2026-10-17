import type { ReactNode } from "react";

import { sectionPath } from "@/shared/config/routes";
import type { SectionProps } from "@/shared/contracts/section";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { BotIcon } from "@/shared/ui/icons/bot";
import { CloudIcon } from "@/shared/ui/icons/cloud";
import { CodeIcon } from "@/shared/ui/icons/code";
import { CompassIcon } from "@/shared/ui/icons/compass";
import { DatabaseIcon } from "@/shared/ui/icons/database";
import { GitBranchIcon } from "@/shared/ui/icons/git-branch";
import { LayoutIcon } from "@/shared/ui/icons/layout";
import { ServerIcon } from "@/shared/ui/icons/server";
import { ShieldIcon } from "@/shared/ui/icons/shield";
import { InternalLink } from "@/shared/ui/internal-link";
import { ITEM_HEADING } from "@/shared/ui/typography.styles";

import { stackEn } from "../content/en";
import { stackEs } from "../content/es";
import { stackFacts } from "../content/facts";
import { AI_TOOL_GROUP_IDS, type StackGroupId, type StackText } from "../types";

const TEXT: Readonly<Record<SectionProps["locale"], StackText>> = { es: stackEs, en: stackEn };

/** Icon of each group (RAM-R08). */
const GROUP_ICONS: Readonly<Record<StackGroupId, ReactNode>> = {
  languages: <CodeIcon />,
  frontend: <LayoutIcon />,
  backend: <ServerIcon />,
  gcp: <CloudIcon />,
  aws: <CloudIcon />,
  devops: <GitBranchIcon />,
  data: <DatabaseIcon />,
  security: <ShieldIcon />,
};

/**
 * Tech stack: technologies by area, engineering methods and AI-assisted development, without level
 * indicators (RAM-R04).
 */
export function StackSection({ locale }: SectionProps) {
  const text = TEXT[locale];

  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @[640px]:grid-cols-2">
        {stackFacts.groups.map((group) => {
          const { title, note } = text.groups[group.id];
          return (
            <ContentBlock key={group.id} title={title} icon={GROUP_ICONS[group.id]}>
              <ChipList items={group.items} />
              {note !== undefined && <p className="text-ink-muted text-sm leading-5">{note}</p>}
            </ContentBlock>
          );
        })}
        <ContentBlock title={text.methodsTitle} icon={<CompassIcon />}>
          <ChipList items={text.methods} />
        </ContentBlock>
        {/* How the author works with AI, across the whole width (RAM-R10). */}
        <div className="@[640px]:col-span-2">
          <ContentBlock title={text.aiTitle} icon={<BotIcon />}>
            <p>{text.aiDescription}</p>
            {AI_TOOL_GROUP_IDS.map((group) => (
              <div key={group} className="space-y-2">
                <h4 className={ITEM_HEADING}>{text.aiGroups[group]}</h4>
                <ChipList items={stackFacts.aiTools[group]} />
              </div>
            ))}
            <p>
              <InternalLink href={sectionPath(locale, "about")}>{text.aboutLinkLabel}</InternalLink>
            </p>
          </ContentBlock>
        </div>
      </div>
    </div>
  );
}
