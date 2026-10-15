import Link from "next/link";
import { Fragment } from "react";

import { cvPath, homePath } from "@/shared/config/routes";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";
import { cn } from "@/shared/lib/cn";

import {
  SWITCHER_BASE,
  SWITCHER_CURRENT,
  SWITCHER_LINK,
  SWITCHER_OPTION,
  SWITCHER_SEPARATOR,
} from "./language-switcher.styles";
import type { Surface } from "./link.styles";
import {
  SEGMENT_CORNERS,
  SEGMENT_CURRENT,
  SEGMENT_GROUP,
  SEGMENT_LINK,
  SEGMENT_OPTION,
} from "./view-switcher.styles";

export type SiteView = "interactive" | "simple";

interface ViewSwitcherProps {
  readonly locale: Locale;
  /** The view the visitor is in. */
  readonly current: SiteView;
  readonly surface: Surface;
}

/**
 * The two ways to see the site, with the current one marked, as the language switcher does with
 * the languages (SET-R32, SET-R33). On a dark surface it looks like the language switcher; on a
 * light one it is a segmented control with the look of a button, so the way back to the scene is
 * easy to find from the simple view. It needs no state, so it renders on the server as well.
 */
export function ViewSwitcher({ locale, current, surface }: ViewSwitcherProps) {
  const { common } = getUiDictionary(locale);
  const options = [
    { view: "interactive", label: common.interactiveViewLabel, href: homePath(locale) },
    { view: "simple", label: common.simpleViewLabel, href: cvPath(locale) },
  ] as const;
  const isLight = surface === "light";

  return (
    <div
      role="group"
      aria-label={common.viewLabel}
      className={isLight ? SEGMENT_GROUP : SWITCHER_BASE}
    >
      {options.map(({ view, label, href }, index) => (
        <Fragment key={view}>
          {!isLight && index > 0 && (
            <span aria-hidden="true" className={SWITCHER_SEPARATOR[surface]}>
              /
            </span>
          )}
          {view === current ? (
            <span
              aria-current="true"
              className={
                isLight
                  ? cn(SEGMENT_OPTION, SEGMENT_CORNERS[index], SEGMENT_CURRENT)
                  : cn(SWITCHER_OPTION, "px-2", SWITCHER_CURRENT[surface])
              }
            >
              {label}
            </span>
          ) : (
            <Link
              href={href}
              className={
                isLight
                  ? cn(SEGMENT_OPTION, SEGMENT_CORNERS[index], SEGMENT_LINK)
                  : cn(SWITCHER_OPTION, "px-2", SWITCHER_LINK[surface])
              }
            >
              {label}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}
