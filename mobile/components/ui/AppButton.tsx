import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
} from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

interface Props extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
}

export function AppButton({ title, loading, variant = 'primary', style, ...props }: Props) {
  const isPrimary = variant === 'primary';

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
        <ActivityIndicator color={isPrimary ? Colors.primaryForeground : Colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textGhost]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  pressed: { opacity: 0.75 },
  text: { fontSize: 15, fontFamily: Fonts.semiBold },
  textPrimary: { color: Colors.primaryForeground },
  textGhost: { color: Colors.textSecondary },
});
