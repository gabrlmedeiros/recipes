import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Tabs, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipesService, type Recipe } from '@/modules/recipes/recipes.service';
import { HeaderActions } from '@/components/HeaderActions';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/constants/theme';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const result = await recipesService.list();
      setRecipes(result.recipes);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadRecipes();
    }, [loadRecipes]),
  );

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => <HeaderActions />,
        }}
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : recipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>Nenhuma receita ainda</Text>
            <Text style={styles.emptySubtitle}>Toque em + para adicionar</Text>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const rightActions = () => (
                <View
                  style={{
                    width: 88,
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                    overflow: 'hidden',
                    marginVertical: 0,
                    marginRight: -2,
                  }}
                >
                  <Pressable
                    onPress={() => {
                      Alert.alert('Excluir', 'Deseja realmente excluir esta receita?', [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await recipesService.delete(item.id);
                              setRecipes((prev) => prev.filter((r) => r.id !== item.id));
                            } catch {
                              Alert.alert('Erro', 'Não foi possível excluir a receita.');
                            }
                          },
                        },
                      ]);
                    }}
                    style={{
                      flex: 1,
                      height: '100%',
                      backgroundColor: colors.destructive ?? '#ff4d4f',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                  </Pressable>
                </View>
              );

              return (
                <Swipeable renderRightActions={rightActions}>
                  <Pressable
                    onPress={() => router.push(`/${item.id}`)}
                    style={({ pressed }) => [styles.card, { opacity: pressed ? 0.8 : 1 }]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.cardName}>{item.name}</Text>
                      <Pressable
                        onPress={() => router.push(`/recipe-form/${item.id}`)}
                        style={({ pressed }) => [styles.editButton, { opacity: pressed ? 0.6 : 1 }]}
                        accessibilityLabel="Editar receita"
                      >
                        <Text style={[styles.editText, { color: colors.primary }]}>{'Editar'}</Text>
                      </Pressable>
                    </View>
                    <View style={styles.cardMeta}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.category.name}</Text>
                      </View>
                      <Text style={styles.metaText}>⏱ {item.prepTimeMinutes} min</Text>
                      <Text style={styles.metaText}>🍽 {item.servings} porções</Text>
                    </View>
                  </Pressable>
                </Swipeable>
              );
            }}
          />
        )}

        {/* FAB */}
        <Pressable
          testID="fab-button"
          onPress={() => router.push('/recipe-form')}
          style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="add" size={28} color={colors.primaryForeground} />
        </Pressable>
      </View>
    </>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPage,
    },
    emptyState: {
      flex: 1,
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
      color: colors.textSecondary,
    },
    list: {
      padding: 16,
      gap: 12,
    },
    card: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 12,
      padding: 16,
      gap: 8,
    },
    editButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    editText: {
      fontSize: 14,
      fontFamily: Fonts.semiBold,
    },
    cardName: {
      fontSize: 15,
      fontFamily: Fonts.semiBold,
      color: colors.textPrimary,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    badge: {
      backgroundColor: colors.bgElevated,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
    },
    badgeText: {
      fontSize: 11,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
    },
    metaText: {
      fontSize: 12,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
    },
    fab: {
      position: 'absolute',
      bottom: 28,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
}
