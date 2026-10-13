import { type IconProps, SvgIcon } from "./svg-icon";

/** Shape from the Lucide icon set (ISC license). */
export function CodeIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="m16 18 6-6-6-6" />
      <path d="m8 6-6 6 6 6" />
    </SvgIcon>
  );
}
