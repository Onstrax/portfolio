"use client";

import { usePathname } from "next/navigation";

import { parsePath } from "@/shared/config/routes";
import type { QuickContact } from "@/shared/contracts/navigation";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { STAGE_BOX } from "@/shared/ui/stage.styles";
import { ViewSwitcher } from "@/shared/ui/view-switcher";

import { QuickContactLink } from "./quick-contact-link";
import { BAR, BAR_SEPARATOR, BAR_VIEWPORT } from "./settings.styles";

interface FixedBarProps {
  /** Tells this bar from the other one on the page, to return the focus to its language switcher. */
  readonly focusKey: string;
  /** The direct contacts, resolved by the server layout (SET-R31). */
  readonly contacts: readonly QuickContact[];
  /**
   * Where the bar sits: on the corner of the stage, or on the corner of the viewport, as the copy
   * drawn inside an open panel does, so that it never covers the header of the panel (SET-R02).
   */
  readonly anchor?: "stage" | "viewport";
}

/**
 * The controls that are always at hand over the scene: language, the view and the direct
 * contacts (SET-R01, SET-R02). It sits on the top right corner of the stage, which the image keeps free
 * (AST-R47), and is not shown until the boot sequence is done (SET-R04).
 */
export function FixedBar({ focusKey, contacts, anchor = "stage" }: FixedBarProps) {
  const dictionary = useUiDictionary();
  const { common, settings } = dictionary;
  const locale = useLocale();
  // With a panel open, the copy drawn inside it is the one in use: this one hides (SET-R02).
  const pathname = usePathname();
  const isCoveredByPanel = anchor === "stage" && parsePath(pathname)?.view === "section";

  return (
    <div className={isCoveredByPanel ? `${BAR_VIEWPORT} invisible` : BAR_VIEWPORT}>
      <div className={anchor === "stage" ? STAGE_BOX : "relative size-full"}>
        <nav aria-label={settings.barAriaLabel} className={BAR}>
          <LanguageSwitcher label={common.languageLabel} focusKey={focusKey} surface="dark" />
          <ViewSwitcher locale={locale} current="interactive" surface="dark" />
          <span aria-hidden="true" className={BAR_SEPARATOR} />
          <ul className="flex items-center">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <QuickContactLink contact={contact} dictionary={dictionary} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
