"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/shared/lib/cn";

import { CheckIcon } from "./icons/check";
import { CopyIcon } from "./icons/copy";
import { BUTTON_BASE, BUTTON_VARIANTS } from "./link.styles";

/** Time the confirmation stays visible (IO-R15). */
const CONFIRMATION_MS = 2000;

interface CopyButtonProps {
  /** Text placed on the clipboard. */
  readonly text: string;
  /** Visible text of the button. */
  readonly label: string;
  /** Accessible name of the button, which says what it copies. */
  readonly accessibleName: string;
  /** Text shown and announced after copying. */
  readonly copiedLabel: string;
}

function subscribeToNothing(): () => void {
  return () => undefined;
}

function hasClipboard(): boolean {
  return typeof navigator.clipboard.writeText === "function";
}

function canCopy(): boolean {
  try {
    return hasClipboard();
  } catch {
    return false;
  }
}

/**
 * Copies a text to the clipboard. It is rendered hidden and appears once the page is hydrated and
 * the browser offers the clipboard API, so that there is never a button that does nothing
 * (IO-R13 to IO-R15).
 */
export function CopyButton({ text, label, accessibleName, copiedLabel }: CopyButtonProps) {
  const isAvailable = useSyncExternalStore(subscribeToNothing, canCopy, () => false);
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  const copy = (): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => {
          setIsCopied(false);
        }, CONFIRMATION_MS);
      })
      .catch(() => undefined);
  };

  return (
    <>
      <button
        type="button"
        hidden={!isAvailable}
        aria-label={accessibleName}
        onClick={copy}
        className={cn(BUTTON_BASE, BUTTON_VARIANTS.secondary)}
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {isCopied ? copiedLabel : label}
      </button>
      <span role="status" className="sr-only">
        {isCopied ? copiedLabel : null}
      </span>
    </>
  );
}
