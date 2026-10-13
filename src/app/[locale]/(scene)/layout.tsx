import type { ReactNode } from "react";

interface SceneGroupLayoutProps {
  readonly children: ReactNode;
}

export default function SceneGroupLayout({ children }: SceneGroupLayoutProps) {
  return children;
}
