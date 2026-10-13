import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SectionScroller } from "@/features/simple-view";
import { CONTENT_ID, PersonJsonLd, SimpleView } from "@/features/simple-view/server";
import { isLocale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { SkipLink } from "@/shared/ui/skip-link";

interface SceneGroupLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ readonly locale: string }>;
}

/**
 * Layout of the home and section pages. The base layer, with the whole simple view, is always in
 * the server HTML (SYS-R14); the scene layer is added on top of it in a later milestone.
 */
export default async function SceneGroupLayout({ children, params }: SceneGroupLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const { common } = getUiDictionary(locale);

  return (
    <>
      <SkipLink label={common.skipToContentLabel} targetId={CONTENT_ID} />
      <div data-layer="base">
        <SimpleView locale={locale} variant="base" />
        <PersonJsonLd locale={locale} />
      </div>
      <SectionScroller />
      {children}
    </>
  );
}
