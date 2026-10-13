import { describe, expect, it } from "vitest";

import { settleAnimations } from "./settle-animations";

function deferred() {
  let resolve: () => void = () => undefined;
  let reject: (reason: Error) => void = () => undefined;
  const finished = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { finished, resolve, reject };
}

describe("settleAnimations", () => {
  it("resolves at once without an element or without support for animations", async () => {
    await expect(settleAnimations(null)).resolves.toBeUndefined();
    await expect(settleAnimations({})).resolves.toBeUndefined();
    await expect(settleAnimations({ getAnimations: () => [] })).resolves.toBeUndefined();
  });

  it("waits for every animation of the subtree", async () => {
    const first = deferred();
    const second = deferred();
    let isSettled = false;
    const options: unknown[] = [];
    const settled = settleAnimations({
      getAnimations: (given) => {
        options.push(given);
        return [first, second];
      },
    }).then(() => {
      isSettled = true;
    });

    first.resolve();
    await Promise.resolve();
    expect(isSettled).toBe(false);

    second.resolve();
    await settled;
    expect(isSettled).toBe(true);
    expect(options).toEqual([{ subtree: true }]);
  });

  it("looks only at the element itself when asked to", async () => {
    const options: unknown[] = [];
    await settleAnimations(
      {
        getAnimations: (given) => {
          options.push(given);
          return [];
        },
      },
      "self",
    );
    expect(options).toEqual([{ subtree: false }]);
  });

  it("also resolves when an animation is cancelled", async () => {
    const cancelled = deferred();
    const settled = settleAnimations({ getAnimations: () => [cancelled] });
    cancelled.reject(new Error("The animation was cancelled"));
    await expect(settled).resolves.toBeUndefined();
  });
});
