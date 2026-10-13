import { describe, expect, it } from "vitest";

import {
  hasVisibleLabel,
  INITIAL_LABEL_STATE,
  isLabelVisible,
  LABEL_HIDE_DELAY_MS,
  type LabelEvent,
  labelReducer,
  type LabelState,
} from "./label-state";

function after(...events: readonly LabelEvent[]): LabelState {
  return events.reduce(labelReducer, INITIAL_LABEL_STATE);
}

const enterCpu: LabelEvent = { type: "pointer-enter", id: "cpu" };
const leave: LabelEvent = { type: "pointer-leave" };
const elapsed: LabelEvent = { type: "hide-delay-elapsed" };
const dismiss: LabelEvent = { type: "dismiss" };

describe("labelReducer", () => {
  it("shows no label at first", () => {
    expect(isLabelVisible(INITIAL_LABEL_STATE, "cpu")).toBe(false);
    expect(hasVisibleLabel(INITIAL_LABEL_STATE)).toBe(false);
  });

  it("SCN-AC08: shows the label of the zone under the pointer, and only that one", () => {
    const state = after(enterCpu);
    expect(isLabelVisible(state, "cpu")).toBe(true);
    expect(isLabelVisible(state, "ram")).toBe(false);
    expect(hasVisibleLabel(state)).toBe(true);
  });

  it("SCN-AC08: keeps the label for 150 ms after the pointer leaves, then hides it", () => {
    expect(LABEL_HIDE_DELAY_MS).toBe(150);
    expect(isLabelVisible(after(enterCpu, leave), "cpu")).toBe(true);
    expect(isLabelVisible(after(enterCpu, leave, elapsed), "cpu")).toBe(false);
  });

  it("SCN-AC08: keeps the label when the pointer returns to the zone or moves onto the label", () => {
    const state = after(enterCpu, leave, enterCpu, elapsed);
    expect(isLabelVisible(state, "cpu")).toBe(true);
  });

  it("moves the label when the pointer goes straight to another zone", () => {
    const state = after(enterCpu, leave, { type: "pointer-enter", id: "ram" }, elapsed);
    expect(isLabelVisible(state, "cpu")).toBe(false);
    expect(isLabelVisible(state, "ram")).toBe(true);
  });

  it("ignores a delay that elapses when the pointer is not leaving", () => {
    expect(after(enterCpu, elapsed)).toEqual(after(enterCpu));
    expect(after(leave)).toEqual(INITIAL_LABEL_STATE);
  });

  it("SCN-AC07: shows the label of the zone with keyboard focus, until it loses it", () => {
    const focused = after({ type: "focus", id: "cpu" });
    expect(isLabelVisible(focused, "cpu")).toBe(true);
    expect(isLabelVisible(labelReducer(focused, { type: "blur" }), "cpu")).toBe(false);
  });

  it("shows two labels when the pointer is on one zone and the focus on another", () => {
    const state = after(enterCpu, { type: "focus", id: "ssd" });
    expect(isLabelVisible(state, "cpu")).toBe(true);
    expect(isLabelVisible(state, "ssd")).toBe(true);
  });

  it("SCN-AC08: Esc hides the visible labels and they stay hidden while nothing moves", () => {
    const state = after(enterCpu, { type: "focus", id: "ssd" }, dismiss);
    expect(isLabelVisible(state, "cpu")).toBe(false);
    expect(isLabelVisible(state, "ssd")).toBe(false);
    expect(hasVisibleLabel(state)).toBe(false);
    // The pointer moving inside the zone fires no new event, and one more enter changes nothing.
    expect(isLabelVisible(labelReducer(state, enterCpu), "cpu")).toBe(false);
  });

  it("shows a hidden label again once the pointer leaves and comes back", () => {
    expect(isLabelVisible(after(enterCpu, dismiss, leave, enterCpu), "cpu")).toBe(true);
    expect(isLabelVisible(after(enterCpu, dismiss, leave, elapsed, enterCpu), "cpu")).toBe(true);
    expect(isLabelVisible(after(enterCpu, dismiss, leave), "cpu")).toBe(false);
  });

  it("shows a hidden label again once the focus moves away and returns", () => {
    const focusCpu: LabelEvent = { type: "focus", id: "cpu" };
    const hidden = after(focusCpu, dismiss);
    expect(isLabelVisible(hidden, "cpu")).toBe(false);
    expect(isLabelVisible(after(focusCpu, dismiss, { type: "blur" }, focusCpu), "cpu")).toBe(true);
    expect(isLabelVisible(labelReducer(hidden, { type: "focus", id: "ram" }), "ram")).toBe(true);
  });

  it("Esc with no label visible changes nothing", () => {
    expect(after(dismiss)).toEqual(INITIAL_LABEL_STATE);
  });
});
