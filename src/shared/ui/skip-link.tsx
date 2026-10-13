interface SkipLinkProps {
  readonly label: string;
  /** `id` of the main content of the page. */
  readonly targetId: string;
}

/**
 * First focusable element of a page: it is only visible while it has focus and takes the visitor
 * past the navigation, to the main content (QLT-R02).
 */
export function SkipLink({ label, targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="rounded-control bg-ink text-screen sr-only px-4 py-3 font-mono text-sm leading-5 font-semibold focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-(--z-skip-link) print:hidden"
    >
      {label}
    </a>
  );
}
