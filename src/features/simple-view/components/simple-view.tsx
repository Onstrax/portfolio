import { SECTION_LIST } from "@/features/registry";
import { homePath } from "@/shared/config/routes";
import { CV_FILES, SITE } from "@/shared/config/site";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui/button-link";
import { DownloadIcon } from "@/shared/ui/icons/download";
import { InternalLink } from "@/shared/ui/internal-link";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { LINK_BASE, LINK_SURFACES } from "@/shared/ui/link.styles";
import { SkipLink } from "@/shared/ui/skip-link";

/** `id` of the main content, target of the skip link and of "back to top" (SMP-R04). */
export const CONTENT_ID = "content";

interface SimpleViewProps {
  readonly locale: Locale;
  /**
   * `base` when it is the base layer under the scene, where the layout provides the skip link;
   * `standalone` on the page that always shows it (SMP-R03).
   */
  readonly variant: "base" | "standalone";
}

const TEXT_LINK = cn(LINK_BASE, LINK_SURFACES.light);

/**
 * The whole profile as a plain page, one section after another, without the hardware metaphor.
 * It is what phones, search engines and visitors without JavaScript get, and it works with
 * links and anchors alone (SMP-R03 to SMP-R08).
 */
export function SimpleView({ locale, variant }: SimpleViewProps) {
  const { common, simpleView } = getUiDictionary(locale);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6">
      {variant === "standalone" && (
        <SkipLink label={common.skipToContentLabel} targetId={CONTENT_ID} />
      )}

      <header className="space-y-4">
        <h1 className="font-mono text-3xl leading-9 font-semibold">{SITE.authorName}</h1>
        <div className="flex flex-wrap items-center gap-4 print:hidden">
          <LanguageSwitcher label={common.languageLabel} focusKey="simple-view" surface="light" />
          <ButtonLink
            href={CV_FILES[locale]}
            downloadType="application/pdf"
            icon={<DownloadIcon />}
          >
            {common.downloadCvLabel}
          </ButtonLink>
        </div>
        <p className="text-ink-muted scene-capable:hidden text-sm leading-5 print:hidden">
          {simpleView.desktopHint}
        </p>
        {variant === "standalone" && (
          <p className="print:hidden">
            <span className="scene-capable:inline hidden">
              <InternalLink href={homePath(locale)}>{simpleView.interactiveLinkLabel}</InternalLink>
            </span>
          </p>
        )}
      </header>

      <nav aria-label={simpleView.navAriaLabel} className="mt-6 print:hidden">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          {SECTION_LIST.map((section) => (
            <li key={section.slug}>
              <a href={`#${section.slug}`} className={TEXT_LINK}>
                {section.text[locale].meta.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main id={CONTENT_ID} tabIndex={-1} className="focus:outline-none">
        {SECTION_LIST.map(({ slug, text, Section }) => (
          <section
            key={slug}
            id={slug}
            aria-labelledby={`${slug}-title`}
            className="border-ink/20 mt-12 scroll-mt-4 border-t pt-12"
          >
            <h2
              id={`${slug}-title`}
              tabIndex={-1}
              className="mb-6 font-mono text-2xl leading-8 font-semibold tracking-[0.06em] uppercase focus:outline-none"
            >
              {text[locale].meta.title}
            </h2>
            <Section locale={locale} idScope="" />
          </section>
        ))}
      </main>

      <footer className="border-ink/20 mt-12 border-t pt-6 print:hidden">
        <a href={`#${CONTENT_ID}`} className={TEXT_LINK}>
          {simpleView.backToTopLabel}
        </a>
      </footer>
    </div>
  );
}
