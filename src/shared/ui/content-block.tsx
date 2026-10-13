import type { ReactNode } from "react";

interface ContentBlockProps {
  readonly title: string;
  /** Decorative icon shown before the heading. */
  readonly icon: ReactNode;
  readonly children: ReactNode;
}

/**
 * A block of a section: a first-level heading with its icon, and the content below (VIS-R27).
 * Section headings start at `<h3>`, because whoever shows the section renders its `<h2>`.
 */
export function ContentBlock({ title, icon, children }: ContentBlockProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 font-mono text-sm leading-5 font-semibold tracking-[0.06em] uppercase">
        {icon}
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}
