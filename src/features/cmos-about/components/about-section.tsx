import type { SectionProps } from "@/shared/contracts/section";
import { BulletList } from "@/shared/ui/bullet-list";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { ExternalLink } from "@/shared/ui/external-link";
import { ClipboardCheckIcon } from "@/shared/ui/icons/clipboard-check";
import { GithubIcon } from "@/shared/ui/icons/github";
import { ImageIcon } from "@/shared/ui/icons/image";
import { LayersIcon } from "@/shared/ui/icons/layers";
import { ShieldIcon } from "@/shared/ui/icons/shield";

import { aboutEn } from "../content/en";
import { aboutEs } from "../content/es";
import { aboutFacts } from "../content/facts";

const TEXT = { es: aboutEs, en: aboutEn };

/** About this site: method, stack, what it guarantees and where the code is (CMOS-R06). */
export function AboutSection({ locale }: SectionProps) {
  const text = TEXT[locale];

  return (
    <div className="space-y-6">
      <p>{text.intro}</p>

      <ContentBlock title={text.methodTitle} icon={<ClipboardCheckIcon />}>
        <BulletList items={text.method} />
      </ContentBlock>

      <ContentBlock title={text.stackTitle} icon={<LayersIcon />}>
        <ChipList items={aboutFacts.stack} />
      </ContentBlock>

      <ContentBlock title={text.qualityTitle} icon={<ShieldIcon />}>
        <BulletList items={text.quality} />
      </ContentBlock>

      <ContentBlock title={text.imageTitle} icon={<ImageIcon />}>
        <p>{text.image}</p>
      </ContentBlock>

      <p>
        <ExternalLink
          href={aboutFacts.repository.href}
          locale={locale}
          button="primary"
          icon={<GithubIcon />}
        >
          {text.repositoryLabel}
        </ExternalLink>
      </p>
    </div>
  );
}
