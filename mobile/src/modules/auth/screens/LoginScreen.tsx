import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/modules/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [form, setForm] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  async function handleLogin() {
    setError('');
    try {
      await login(form.login, form.password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? err.message ?? 'Erro ao entrar. Tente novamente.');
    }
  }

  const { colors } = useTheme();

  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🍽️</Text>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>
        </View>

        <View style={styles.card}>
          <AppInput
            label="Login"
            value={form.login}
            onChangeText={(v) => setForm((p) => ({ ...p, login: v }))}
            placeholder="Seu login"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppInput
            label="Senha"
            value={form.password}
            onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
            placeholder="Sua senha"
            secureTextEntry
          />
          {!!error && <Text style={styles.errorBox}>{error}</Text>}
          <AppButton title="Entrar" loading={loading} onPress={handleLogin} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.link}>Criar conta</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bgPage },
    container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
    header: { alignItems: 'center', marginBottom: 32 },
    emoji: { fontSize: 52, marginBottom: 16 },
    title: { fontSize: 22, fontFamily: 'JetBrainsMono_700Bold', color: colors.textPrimary },
    subtitle: { fontSize: 13, fontFamily: 'JetBrainsMono_400Regular', color: colors.textSecondary, marginTop: 4 },
    card: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 16,
      padding: 24,
      gap: 16,
    },
    errorBox: {
      fontSize: 12,
      color: colors.destructive,
      textAlign: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,92,51,0.2)',
      backgroundColor: 'rgba(127,29,29,0.15)',
    },
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
    footerText: { color: colors.textSecondary, fontSize: 13, fontFamily: 'JetBrainsMono_400Regular' },
    link: { color: colors.primary, fontSize: 13, fontFamily: 'JetBrainsMono_600SemiBold' },
  });
}
