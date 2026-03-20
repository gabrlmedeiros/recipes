import { useTheme } from './use-theme';

export function useThemeColor(
  props: { light?: string | undefined; dark?: string | undefined },
  colorName: string,
) {
  const colorFromProps = props.dark ?? props.light;
  const { colors } = useTheme();

  if (colorFromProps) {
    return colorFromProps;
  }

  return (colors as any)[colorName as any];
}

export default useThemeColor;
