"use client";

import Link from "next/link";
import { type KeyboardEvent, useId, useRef } from "react";

import { sectionPath } from "@/shared/config/routes";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { cn } from "@/shared/lib/cn";
import { BUTTON_BASE, BUTTON_VARIANTS } from "@/shared/ui/link.styles";

import { LABEL_NAME, WELCOME_DESCRIPTION, WELCOME_STATES } from "./scene.styles";

const WELCOME_CONTROL = cn(BUTTON_BASE, BUTTON_VARIANTS.onDark);

interface SceneWelcomeProps {
  readonly isVisible: boolean;
  /** Closes the welcome for the rest of the session; `hadFocus` tells if the focus was inside. */
  readonly onDismiss: (hadFocus: boolean) => void;
}

/**
 * The card that greets a first visit once the boot sequence ends (SCN-R48, SCN-R49). It takes
 * neither the focus nor the scene: it waits after the fixed bar in the tab order, and closes with
 * "Explore" or Esc (SCN-R50, SCN-R51).
 */
export function SceneWelcome({ isVisible, onDismiss }: SceneWelcomeProps) {
  const { scene } = useUiDictionary();
  const locale = useLocale();
  const root = useRef<HTMLElement>(null);
  const titleId = useId();
  const dismiss = (): void => {
    onDismiss(root.current?.contains(document.activeElement) === true);
  };
  // Its two controls are all that can hold the focus inside it.
  const closeOnEscape = (event: KeyboardEvent): void => {
    if (event.key === "Escape") dismiss();
  };

  return (
    <section
      ref={root}
      aria-labelledby={titleId}
      data-testid="scene-welcome"
      data-visible={isVisible}
      className={WELCOME_STATES[isVisible ? "visible" : "hidden"]}
    >
      <h2 id={titleId} className={LABEL_NAME}>
        {scene.welcomeTitle}
      </h2>
      <p className={WELCOME_DESCRIPTION}>{scene.welcomeDescription}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className={WELCOME_CONTROL}
          onClick={dismiss}
          onKeyDown={closeOnEscape}
        >
          {scene.exploreLabel}
        </button>
        <Link
          href={sectionPath(locale, "profile")}
          className={WELCOME_CONTROL}
          onKeyDown={closeOnEscape}
        >
          {scene.profileLinkLabel}
        </Link>
      </div>
    </section>
  );
}
