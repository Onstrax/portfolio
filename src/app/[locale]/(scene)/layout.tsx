import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { BootScreen } from "@/features/boot-sequence/server";
import { ScenePoster, SCENE_CONTENT_ID } from "@/features/motherboard-scene/server";
import { SECTION_LIST } from "@/features/registry";
import { SectionScroller } from "@/features/simple-view";
import { CONTENT_ID, PersonJsonLd, SimpleView } from "@/features/simple-view/server";
import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";
import { isLocale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { LOCALE_META } from "@/shared/i18n/locales";
import { buildPrePaintScript } from "@/shared/lib/pre-paint-script";
import { buildSectionNav } from "@/shared/lib/section-nav";
import { FONT_VARIABLES } from "@/shared/ui/fonts";
import { SkipLink } from "@/shared/ui/skip-link";

import { SceneLayer } from "./scene-layer";

interface SceneGroupLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Document of the home and section pages (SYS-R46). The pre-paint script chooses the render mode
 * before the first paint. The base layer, with the whole simple view, is always in the server
 * HTML (SYS-R14); the scene layer is shown instead of it in scene mode, and each mode has the
 * skip link that leads to its own content.
 */
export default async function SceneGroupLayout({ children, params }: SceneGroupLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const { common } = getUiDictionary(locale);

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={FONT_VARIABLES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: buildPrePaintScript(SCENE_ASSETS) }} />
      </head>
      <body>
        <div className="mode-scene:hidden">
          <SkipLink label={common.skipToContentLabel} targetId={CONTENT_ID} />
        </div>
        {/* Hidden during the boot sequence, whose only control is its skip button (BOOT-R15). */}
        <div className="mode-scene:block boot-play:hidden boot-exit:hidden hidden">
          <SkipLink label={common.skipToContentLabel} targetId={SCENE_CONTENT_ID} surface="scene" />
        </div>
        <div data-layer="base" className="mode-scene:hidden">
          <SimpleView locale={locale} variant="base" />
          <PersonJsonLd locale={locale} />
        </div>
        <div data-layer="scene" className="mode-scene:block hidden">
          <BootScreen locale={locale} />
          <ScenePoster />
          <SceneLayer sections={buildSectionNav(SECTION_LIST, locale)}>{children}</SceneLayer>
        </div>
        <SectionScroller />
      </body>
    </html>
  );
}
