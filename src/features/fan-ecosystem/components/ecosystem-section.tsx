import type { SectionProps } from "@/shared/contracts/section";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { HammerIcon } from "@/shared/ui/icons/hammer";
import { MonitorIcon } from "@/shared/ui/icons/monitor";
import { SlidersIcon } from "@/shared/ui/icons/sliders";
import { SunIcon } from "@/shared/ui/icons/sun";
import { PeriodText } from "@/shared/ui/period-text";

import { ecosystemEn } from "../content/en";
import { ecosystemEs } from "../content/es";
import { ecosystemFacts } from "../content/facts";
import { EcosystemItem } from "./ecosystem-item";

const TEXT = { es: ecosystemEs, en: ecosystemEn };

/**
 * Personal ecosystem. What the author built and what he configured are separate blocks, so that
 * neither is mistaken for the other (FAN-R02, FAN-R05).
 */
export function EcosystemSection({ locale }: SectionProps) {
  const text = TEXT[locale];
  const facts = ecosystemFacts;

  return (
    <div className="space-y-6">
      <p>{text.intro}</p>

      <ContentBlock title={text.setupTitle} icon={<MonitorIcon />}>
        {facts.setup.map((item) => (
          <EcosystemItem key={item.id} item={item} text={text.setup[item.id]} locale={locale} />
        ))}
      </ContentBlock>

      <ContentBlock title={text.builtTitle} icon={<HammerIcon />}>
        {facts.built.map((item) => (
          <EcosystemItem key={item.id} item={item} text={text.built[item.id]} locale={locale} />
        ))}
      </ContentBlock>

      <ContentBlock title={text.configuredTitle} icon={<SlidersIcon />}>
        {facts.configured.map((item) => (
          <EcosystemItem
            key={item.id}
            item={item}
            text={text.configured[item.id]}
            locale={locale}
          />
        ))}
      </ContentBlock>

      <ContentBlock title={text.offlineTitle} icon={<SunIcon />}>
        <ChipList items={text.interests} />
        <p>
          {text.leadershipTraining}{" "}
          <span className="text-ink-muted text-sm leading-5">
            <PeriodText period={facts.leadershipTrainingPeriod} locale={locale} />
          </span>
        </p>
      </ContentBlock>
    </div>
  );
}
