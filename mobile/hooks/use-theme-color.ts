import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string | undefined; dark?: string | undefined },
  colorName: keyof typeof Colors,
) {
  const colorFromProps = props.dark ?? props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorName];
}
