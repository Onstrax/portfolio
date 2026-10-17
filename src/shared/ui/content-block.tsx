import type { ReactNode } from "react";

import { BLOCK_HEADING } from "./typography.styles";

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
      {/* The icon grows with the heading (VIS-R27). */}
      <h3 className={`flex items-center gap-2 ${BLOCK_HEADING} [&>svg]:size-5`}>
        {icon}
        {title}
      </h3>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}
