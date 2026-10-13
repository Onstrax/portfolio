import { type IconProps, SvgIcon } from "./svg-icon";

/** Shape from the Lucide icon set (ISC license). */
export function MonitorIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </SvgIcon>
  );
}
