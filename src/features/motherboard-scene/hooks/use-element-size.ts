import { type RefObject, useLayoutEffect, useState } from "react";

import type { PixelSize } from "../lib/label-position";

/** Rendered size of an element, measured before the first paint and after every resize. */
export function useElementSize(ref: RefObject<HTMLElement | null>): PixelSize | null {
  const [size, setSize] = useState<PixelSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (element === null) return;
    const measure = (): void => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current?.width === width && current.height === height ? current : { width, height },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
