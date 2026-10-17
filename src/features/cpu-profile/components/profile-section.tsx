import { PORTRAIT_ASSET } from "@/shared/assets/manifest.generated";
import { crossSectionHref } from "@/shared/config/routes";
import { CV_FILES } from "@/shared/config/site";
import type { SectionProps } from "@/shared/contracts/section";
import { formatDecimal } from "@/shared/i18n/format";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { toSrcSet } from "@/shared/lib/src-set";
import { BulletList } from "@/shared/ui/bullet-list";
import { ButtonLink } from "@/shared/ui/button-link";
import { Chip } from "@/shared/ui/chip";
import { ChipList } from "@/shared/ui/chip-list";
import { ContentBlock } from "@/shared/ui/content-block";
import { AwardIcon } from "@/shared/ui/icons/award";
import { DownloadIcon } from "@/shared/ui/icons/download";
import { FileTextIcon } from "@/shared/ui/icons/file-text";
import { GraduationCapIcon } from "@/shared/ui/icons/graduation-cap";
import { LanguagesIcon } from "@/shared/ui/icons/languages";
import { InternalLink } from "@/shared/ui/internal-link";
import { PeriodText } from "@/shared/ui/period-text";
import { ITEM_HEADING, ITEM_META, PANEL_TITLE } from "@/shared/ui/typography.styles";

import { profileEn } from "../content/en";
import { profileEs } from "../content/es";
import { profileFacts } from "../content/facts";

const TEXT = { es: profileEs, en: profileEn };
const PORTRAIT_SIZE = 96;
const PORTRAIT_SIZES = "96px";

/** Profile: who the author is, summary, education, languages and recognition (CPU-R04). */
export function ProfileSection({ locale, view }: SectionProps) {
  const text = TEXT[locale];
  const facts = profileFacts;
  const { common } = getUiDictionary(locale);
  const gpa = `${text.gpaLabel}: ${formatDecimal(facts.gpa.value, locale, 1)}/${formatDecimal(facts.gpa.scale, locale, 1)}`;
  const courses = `${text.coursesLabel}: ${text.courses.join("; ")}.`;
  const fallback = PORTRAIT_ASSET.sources.jpeg[0].src;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <picture>
          <source
            type="image/avif"
            srcSet={toSrcSet(PORTRAIT_ASSET.sources.avif)}
            sizes={PORTRAIT_SIZES}
          />
          <source
            type="image/webp"
            srcSet={toSrcSet(PORTRAIT_ASSET.sources.webp)}
            sizes={PORTRAIT_SIZES}
          />
          <img
            src={fallback}
            srcSet={toSrcSet(PORTRAIT_ASSET.sources.jpeg)}
            sizes={PORTRAIT_SIZES}
            alt={facts.name}
            width={PORTRAIT_SIZE}
            height={PORTRAIT_SIZE}
            className="rounded-control border-ink border"
          />
        </picture>
        <div className="min-w-0 flex-1 space-y-2">
          <p className={PANEL_TITLE}>{facts.name}</p>
          <p>{text.degree}</p>
          <ChipList items={text.focusAreas} />
          <p className="text-ink-muted text-sm leading-5">{facts.location}</p>
          <p className="text-ink-muted text-sm leading-5">{text.availability}</p>
          <ButtonLink
            href={CV_FILES[locale]}
            downloadType="application/pdf"
            icon={<DownloadIcon />}
          >
            {common.downloadCvLabel}
          </ButtonLink>
        </div>
      </div>

      <ContentBlock title={text.summaryTitle} icon={<FileTextIcon />}>
        <BulletList items={text.summary} />
      </ContentBlock>

      <ContentBlock title={text.educationTitle} icon={<GraduationCapIcon />}>
        {facts.education.map((entry) => (
          <div key={entry.id} className="space-y-1">
            <h4 className={ITEM_HEADING}>{entry.institution}</h4>
            <p>{text.education[entry.id].program}</p>
            <p className={ITEM_META}>
              <PeriodText period={entry.period} locale={locale} />
            </p>
            <p>{text.education[entry.id].detail}</p>
            {entry.id === "uniandes" && (
              <>
                <p>{gpa}</p>
                {/* A paragraph, not a list behind a disclosure: it is read at a glance (CPU-R06). */}
                <p>{courses}</p>
              </>
            )}
            {entry.id === "hm" && <Chip>{facts.exchangeCredits}</Chip>}
          </div>
        ))}
        <p>{text.additionalTraining}</p>
      </ContentBlock>

      <ContentBlock title={text.languagesTitle} icon={<LanguagesIcon />}>
        <ul className="space-y-1">
          {facts.languages.map((id) => (
            <li key={id}>
              <span className="font-semibold">{text.languages[id].name}</span> ·{" "}
              {text.languages[id].level}
            </li>
          ))}
        </ul>
      </ContentBlock>

      <ContentBlock title={text.recognitionTitle} icon={<AwardIcon />}>
        <p>{text.hallOfFame}</p>
        <p>
          {text.projectAwards}{" "}
          <InternalLink href={crossSectionHref(locale, view, "projects")}>
            {text.projectAwardsLinkLabel}
          </InternalLink>
        </p>
      </ContentBlock>
    </div>
  );
}
