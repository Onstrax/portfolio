"use client";

import Link from "next/link";
import { type MouseEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { sectionPath } from "@/shared/config/routes";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { settleAnimations } from "@/shared/lib/settle-animations";
import { CloseIcon } from "@/shared/ui/icons/close";

import {
  WELCOME_BUTTON,
  WELCOME_CLOSE,
  WELCOME_DESCRIPTION,
  WELCOME_DIALOG,
  WELCOME_PROMPT,
  WELCOME_TERMINAL,
  WELCOME_TITLE,
  WELCOME_VEIL,
} from "./scene.styles";

/** Prompt sign before the title: decorative, the same in every language (SCN-R49). */
const PROMPT = "›";

interface SceneWelcomeProps {
  readonly isOpen: boolean;
  /** The visitor closed it: with its button, Esc, a click on the veil or "Explore" (SCN-R50). */
  readonly onDismiss: () => void;
  /** It finished closing after `onDismiss`, and the page is no longer inert. */
  readonly onClosed: () => void;
}

/**
 * The terminal that greets a first visit once the boot sequence ends (SCN-R48, SCN-R49). It is a
 * modal dialog: the focus goes to its title, the rest of the page is inert while it is open, and
 * it closes in five ways, never by itself (SCN-R50, SCN-R51).
 */
export function SceneWelcome({ isOpen, onDismiss, onClosed }: SceneWelcomeProps) {
  const { scene } = useUiDictionary();
  const locale = useLocale();
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  /** Set when the visitor closed it, to know where the focus goes afterwards. */
  const wasDismissed = useRef(false);
  /** The terminal stays drawn while its closing animation plays. */
  const [isClosing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setClosing(!isOpen);
  }
  const isShown = isOpen || isClosing;

  useLayoutEffect(() => {
    const element = dialog.current;
    if (element === null || !isOpen) return;
    if (!element.open) element.showModal();
    title.current?.focus();
  }, [isOpen]);

  // Closes once its animation has played. Only then is the page interactive again, so only then
  // can the focus go back to the scene.
  useEffect(() => {
    if (!isClosing) return;
    let isCurrent = true;
    void settleAnimations(dialog.current).then(() => {
      if (!isCurrent) return;
      dialog.current?.close();
      setClosing(false);
      if (wasDismissed.current) {
        wasDismissed.current = false;
        onClosed();
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [isClosing, onClosed]);

  const dismiss = (): void => {
    if (!isOpen) return;
    wasDismissed.current = true;
    onDismiss();
  };
  // Runs before the handlers of the controls: a click on the veil, outside the terminal, closes it.
  const handleClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === veil.current) dismiss();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className={WELCOME_DIALOG}
      onClickCapture={handleClick}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      // A browser can close a modal dialog on its own, for example on a second Esc.
      onClose={dismiss}
    >
      {isShown && (
        <>
          <div ref={veil} className={WELCOME_VEIL[isOpen ? "open" : "closing"]} />
          <div
            data-testid="scene-welcome"
            className={WELCOME_TERMINAL[isOpen ? "open" : "closing"]}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 ref={title} id={titleId} tabIndex={-1} className={WELCOME_TITLE}>
                <span aria-hidden="true" className={WELCOME_PROMPT}>
                  {PROMPT}
                </span>
                {scene.welcomeTitle}
              </h2>
              <button
                type="button"
                aria-label={scene.closeWelcomeAriaLabel}
                className={WELCOME_CLOSE}
                onClick={dismiss}
              >
                <CloseIcon size={20} />
              </button>
            </div>
            <p className={WELCOME_DESCRIPTION}>{scene.welcomeDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className={WELCOME_BUTTON} onClick={dismiss}>
                {scene.exploreLabel}
              </button>
              {/* Opening the profile closes the welcome too, as any section does (SCN-R50). */}
              <Link href={sectionPath(locale, "profile")} className={WELCOME_BUTTON}>
                {scene.profileLinkLabel}
              </Link>
            </div>
          </div>
        </>
      )}
    </dialog>
  );
}
