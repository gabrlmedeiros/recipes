import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type TextStyle,
} from 'react-native';
import { Fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface Props extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  textStyle?: TextStyle;
}

export function AppButton({ title, loading, variant = 'primary', style, textStyle, ...props }: Props) {
  const isPrimary = variant === 'primary';
  const { colors } = useTheme();

  const styles = makeStyles(colors);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        typeof style === 'function' ? style({ pressed, hovered: false }) : style,
      ]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryForeground : colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    base: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: { backgroundColor: colors.primary },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.borderPrimary,
    },
    pressed: { opacity: 0.75 },
    text: { fontSize: 15, fontFamily: Fonts.semiBold },
    textPrimary: { color: colors.primaryForeground },
    textGhost: { color: colors.textSecondary },
  });
}

export default AppButton;
