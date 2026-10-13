import type { ReactNode } from "react";

interface RootLayoutProps {
  readonly children: ReactNode;
}

/** Each branch renders its own <html> so that `lang` matches its locale (SYS-R22). */
export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
