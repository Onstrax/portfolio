import { useCallback, useEffect, useReducer, useRef } from "react";

import type { SceneObjectId } from "@/shared/contracts/ids";

import {
  hasVisibleLabel,
  INITIAL_LABEL_STATE,
  LABEL_HIDE_DELAY_MS,
  labelReducer,
  type LabelState,
} from "../lib/label-state";

export interface Labels {
  readonly state: LabelState;
  /** The pointer entered a zone or its label. */
  readonly enter: (id: SceneObjectId) => void;
  /** The pointer left a zone or its label. */
  readonly leave: () => void;
  /** A zone received keyboard focus. */
  readonly focus: (id: SceneObjectId) => void;
  readonly blur: () => void;
}

/**
 * Follows the pointer and the keyboard focus over the zones to decide which labels are shown
 * (SCN-R23), and hides them when the visitor presses Esc (SCN-R24).
 */
export function useLabels(): Labels {
  const [state, dispatch] = useReducer(labelReducer, INITIAL_LABEL_STATE);
  const hideTimer = useRef<number | undefined>(undefined);

  const enter = useCallback((id: SceneObjectId) => {
    window.clearTimeout(hideTimer.current);
    dispatch({ type: "pointer-enter", id });
  }, []);
  const leave = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    dispatch({ type: "pointer-leave" });
    hideTimer.current = window.setTimeout(() => {
      dispatch({ type: "hide-delay-elapsed" });
    }, LABEL_HIDE_DELAY_MS);
  }, []);
  const focus = useCallback((id: SceneObjectId) => {
    dispatch({ type: "focus", id });
  }, []);
  const blur = useCallback(() => {
    dispatch({ type: "blur" });
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(hideTimer.current);
    },
    [],
  );

  const isShowingLabel = hasVisibleLabel(state);
  useEffect(() => {
    if (!isShowingLabel) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") dispatch({ type: "dismiss" });
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isShowingLabel]);

  return { state, enter, leave, focus, blur };
}
