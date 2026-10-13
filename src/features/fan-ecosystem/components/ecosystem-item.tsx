import type { ExternalUrl } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import { Chip } from "@/shared/ui/chip";
import { ExternalLink } from "@/shared/ui/external-link";
import { FactChips } from "@/shared/ui/fact-chips";

import type { EcosystemItemFact, EcosystemItemText } from "../types";

interface EcosystemItemProps {
  readonly item: EcosystemItemFact<string>;
  readonly text: EcosystemItemText;
  readonly locale: Locale;
}

function isExternal(href: string): href is ExternalUrl {
  return href.startsWith("https://");
}

/** One entry of the ecosystem: what it is, the tools behind it and where to find it (FAN-R06). */
export function EcosystemItem({ item, text, locale }: EcosystemItemProps) {
  const href = item.link?.href;

  return (
    <div className="space-y-2">
      <h4 className="font-semibold">{text.name}</h4>
      <p>{text.description}</p>
      <div className="flex flex-wrap gap-2">
        {item.tools.map((tool) => (
          <Chip key={tool}>{tool}</Chip>
        ))}
        {item.repository === "private" && <FactChips locale={locale} repository="private" />}
      </div>
      {href !== undefined && isExternal(href) && text.linkLabel !== undefined && (
        <p>
          <ExternalLink href={href} locale={locale}>
            {text.linkLabel}
          </ExternalLink>
        </p>
      )}
    </div>
  );
}
