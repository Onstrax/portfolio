"use client";

import Link from "next/link";

import { cvPath } from "@/shared/config/routes";
import type { QuickContact } from "@/shared/contracts/navigation";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { STAGE_BOX } from "@/shared/ui/stage.styles";

import { QuickContactLink } from "./quick-contact-link";
import { BAR, BAR_LINK, BAR_SEPARATOR, BAR_VIEWPORT } from "./settings.styles";

interface FixedBarProps {
  /** Tells this bar from the other one on the page, to return the focus to its language switcher. */
  readonly focusKey: string;
  /** The direct contacts, resolved by the server layout (SET-R31). */
  readonly contacts: readonly QuickContact[];
}

/**
 * The controls that are always at hand over the scene: language, the way to the simple view and
 * the direct contacts (SET-R01, SET-R02). It sits on the top right corner of the stage, which the image keeps free
 * (AST-R47), and is not shown until the boot sequence is done (SET-R04).
 */
export function FixedBar({ focusKey, contacts }: FixedBarProps) {
  const dictionary = useUiDictionary();
  const { common, settings } = dictionary;
  const locale = useLocale();

  return (
    <div className={BAR_VIEWPORT}>
      <div className={STAGE_BOX}>
        <nav aria-label={settings.barAriaLabel} className={BAR}>
          <LanguageSwitcher label={common.languageLabel} focusKey={focusKey} surface="dark" />
          <Link href={cvPath(locale)} className={BAR_LINK}>
            {settings.simpleViewLabel}
          </Link>
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
