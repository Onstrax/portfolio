import { type IconProps, SvgIcon } from "./svg-icon";

/** Shape from the Lucide icon set (ISC license). */
export function FlagIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </SvgIcon>
  );
}
