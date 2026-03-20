import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function AppInput({ label, error, style, secureTextEntry, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry === true;
  const { colors } = useTheme();

  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          editable={props.editable ?? true}
          style={[styles.input, isPassword && styles.inputWithIcon, !!error && styles.inputError, style, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          secureTextEntry={isPassword && !showPassword}
          onChangeText={(text) => {
            if (props.onChangeText) props.onChangeText(text);
          }}
          textAlignVertical="center"
          autoCorrect={false}
          {...props}
        />
        {isPassword && (
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}
function makeStyles(colors: any) {
  return StyleSheet.create({
    container: { gap: 6 },
    label: {
      fontSize: 11,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    inputWrapper: { position: 'relative' },
    input: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 14,
      fontFamily: Fonts.regular,
    },
    inputWithIcon: { paddingRight: 44 },
    inputError: { borderColor: colors.destructive },
    error: { fontSize: 12, color: colors.destructive },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
    },
  });
}

export default AppInput;
