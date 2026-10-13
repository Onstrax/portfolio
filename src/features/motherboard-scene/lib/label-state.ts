import type { SceneObjectId } from "@/shared/contracts/ids";

/** Time that a label stays after the pointer leaves, in case it comes back (SCN-R23). */
export const LABEL_HIDE_DELAY_MS = 150;

export interface LabelState {
  /** Zone, or label of a zone, under the pointer. */
  readonly hovered: SceneObjectId | null;
  /** `true` from the moment the pointer leaves until the label is hidden or the pointer returns. */
  readonly isLeaving: boolean;
  /** Zone with keyboard focus. */
  readonly focused: SceneObjectId | null;
  /** Zones whose label the visitor hid with Esc (SCN-R24). */
  readonly dismissed: readonly SceneObjectId[];
}

export type LabelEvent =
  | { readonly type: "pointer-enter"; readonly id: SceneObjectId }
  | { readonly type: "pointer-leave" }
  | { readonly type: "hide-delay-elapsed" }
  | { readonly type: "focus"; readonly id: SceneObjectId }
  | { readonly type: "blur" }
  | { readonly type: "dismiss" };

export const INITIAL_LABEL_STATE: LabelState = {
  hovered: null,
  isLeaving: false,
  focused: null,
  dismissed: [],
};

function without(
  dismissed: readonly SceneObjectId[],
  id: SceneObjectId | null,
): readonly SceneObjectId[] {
  return dismissed.filter((other) => other !== id);
}

/**
 * Which labels of the scene are shown (SCN-R23, SCN-R24). A label follows the pointer and the
 * keyboard focus; Esc hides it until the pointer leaves and comes back or the focus moves.
 */
export function labelReducer(state: LabelState, event: LabelEvent): LabelState {
  switch (event.type) {
    case "pointer-enter": {
      const isReturn = state.hovered === event.id && !state.isLeaving;
      return {
        ...state,
        hovered: event.id,
        isLeaving: false,
        dismissed: isReturn ? state.dismissed : without(state.dismissed, event.id),
      };
    }
    case "pointer-leave":
      return { ...state, isLeaving: state.hovered !== null };
    case "hide-delay-elapsed":
      if (!state.isLeaving) return state;
      return {
        ...state,
        hovered: null,
        isLeaving: false,
        dismissed: without(state.dismissed, state.hovered),
      };
    case "focus":
      return { ...state, focused: event.id, dismissed: without(state.dismissed, event.id) };
    case "blur":
      return { ...state, focused: null, dismissed: without(state.dismissed, state.focused) };
    case "dismiss":
      return {
        ...state,
        dismissed: [state.hovered, state.focused].filter((id) => id !== null),
      };
  }
}

/** `true` when the label of a zone is shown. */
export function isLabelVisible(state: LabelState, id: SceneObjectId): boolean {
  return (state.hovered === id || state.focused === id) && !state.dismissed.includes(id);
}

/** `true` when some label is shown, so that Esc has something to hide. */
export function hasVisibleLabel(state: LabelState): boolean {
  return [state.hovered, state.focused].some((id) => id !== null && isLabelVisible(state, id));
}
