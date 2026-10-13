import { useCallback, useSyncExternalStore } from "react";

function getServerSnapshot(): null {
  return null;
}

/** Current value of an attribute of `<html>`, kept up to date when something rewrites it. */
export function useDocumentAttribute(name: string): string | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: [name] });
      return () => {
        observer.disconnect();
      };
    },
    [name],
  );
  const getSnapshot = useCallback(() => document.documentElement.getAttribute(name), [name]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
