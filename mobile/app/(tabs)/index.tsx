import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '../../components/ui/AppButton';
import { authService } from '../../src/modules/auth/auth.service';
import { storage } from '../../src/shared/storage/storage';
import { Fonts } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export default function RecipesScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isDark, colors, toggleTheme } = useTheme();

  async function handleLogout() {
    setLoading(true);
    try {
      await authService.logout();
    } catch {
    } finally {
      await storage.removeToken();
      setLoading(false);
      router.replace('/login');
    }
  }

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 }}>
              <Pressable
                onPress={toggleTheme}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 8, borderRadius: 8 })}
              >
                <Ionicons
                  name={isDark ? 'sunny-outline' : 'moon-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </Pressable>
              <AppButton
                title="Sair"
                variant="ghost"
                loading={loading}
                onPress={handleLogout}
                style={{ paddingVertical: 8, paddingHorizontal: 14 }}
              />
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <Text style={styles.emptyIcon}>🍽️</Text>
        <Text style={styles.emptyTitle}>Nenhuma receita ainda</Text>
        <Text style={styles.emptySubtitle}>Suas receitas aparecerão aqui</Text>
      </View>
    </>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPage,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    emptyIcon: {
      fontSize: 52,
    },
    emptyTitle: {
      fontSize: 16,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 13,
      fontFamily: Fonts.regular,
      color: colors.textTertiary,
    },
  });
}
