import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { Tabs, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { recipesService, type Recipe } from '@/modules/recipes/recipes.service';
import { HeaderActions } from '@/components/HeaderActions';
import { AppInput } from '@/components/ui/AppInput';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/constants/theme';
import RecipeSearchFilters from '@/modules/recipes/components/RecipeSearchFilters';

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [q, setQ] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterIngredient, setFilterIngredient] = useState('');
  const [filterMinPrep, setFilterMinPrep] = useState<string>('');
  const [filterMaxPrep, setFilterMaxPrep] = useState<string>('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState<'asc'|'desc'>('desc');
  const [categories, setCategories] = useState<{id:string;name:string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { colors } = useTheme();

  const loadRecipes = useCallback(async (page = 1, filters?: Record<string, any>) => {
    setLoading(true);
    try {
      const finalFilters: any = {
        ...filters,
      };
      const result = await recipesService.list(page, 50, finalFilters);
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

  useEffect(() => {
    recipesService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const onShow = (e: any) => setKeyboardHeight(e.endCoordinates?.height ?? 250);
    const onHide = () => setKeyboardHeight(0);
    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <>
      <Tabs.Screen
        options={{
          headerRight: () => <HeaderActions />,
        }}
      />

      <View style={styles.container}>
        {/* Search + filters */}
        <View style={styles.searchRow}>
          <View style={{ flex: 1, height: 56, justifyContent: 'center' }}>
            <AppInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar receitas"
            />
          </View>

          <View style={styles.actionButtons}>
              <Pressable testID="buscar-button" onPress={() => { void loadRecipes(1, {
              q: q || undefined,
              categoryId: filterCategory || undefined,
              ingredient: filterIngredient || undefined,
              minPrepTime: filterMinPrep ? Number(filterMinPrep) : undefined,
              maxPrepTime: filterMaxPrep ? Number(filterMaxPrep) : undefined,
              sortBy: sortBy || undefined,
              order: order || undefined,
            }); }} style={({ pressed }) => [styles.iconButton, { marginLeft: 8, opacity: pressed ? 0.8 : 1 }]} accessibilityLabel="Buscar">
              <Ionicons name="search" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable testID="filtros-button" onPress={() => setShowFilters((s) => !s)} style={({ pressed }) => [styles.iconButton, { marginLeft: 8, opacity: pressed ? 0.8 : 1 }]} accessibilityLabel="Filtros">
              <Ionicons name="options" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        <RecipeSearchFilters
          categories={categories}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterIngredient={filterIngredient}
          setFilterIngredient={setFilterIngredient}
          filterMinPrep={filterMinPrep}
          setFilterMinPrep={setFilterMinPrep}
          filterMaxPrep={filterMaxPrep}
          setFilterMaxPrep={setFilterMaxPrep}
          sortBy={sortBy}
          setSortBy={setSortBy}
          order={order}
          setOrder={setOrder}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          onApply={() => { void loadRecipes(1, { q: q || undefined, categoryId: filterCategory || undefined, ingredient: filterIngredient || undefined, minPrepTime: filterMinPrep ? Number(filterMinPrep) : undefined, maxPrepTime: filterMaxPrep ? Number(filterMaxPrep) : undefined, sortBy: sortBy || undefined, order: order || undefined }); }}
          onClear={() => { setQ(''); setFilterCategory(''); setFilterIngredient(''); setFilterMinPrep(''); setFilterMaxPrep(''); setSortBy(''); setOrder('desc'); void loadRecipes(1, {}); }}
        />
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : recipes?.length === 0 ? (
          <View style={[styles.emptyState, { paddingBottom: Math.max(120, keyboardHeight) }]}> 
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>{q ? 'Nenhuma receita encontrada' : 'Nenhuma receita ainda'}</Text>
            {q ? (
              <Text style={styles.emptySubtitle}>Nenhum resultado para `{q}`</Text>
            ) : (
              <Text style={styles.emptySubtitle}>Toque em + para adicionar</Text>
            )}
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={[styles.list, { paddingBottom: Math.max(120, keyboardHeight) }]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      marginTop: 12,
      marginBottom: 8,
      width: '100%',
      alignSelf: 'stretch',
      zIndex: 20,
      backgroundColor: colors.bgPage,
    },
    searchWrapper: { flex: 1, position: 'relative', alignSelf: 'stretch' },
    searchInput: {
      flex: 1,
      minWidth: 0,
      maxWidth: '100%',
      height: 56,
      flexShrink: 1,
      alignSelf: 'stretch',
      justifyContent: 'center',
      paddingHorizontal: 12,
      fontSize: 16,
    },
    searchIcons: { position: 'absolute', right: 8, top: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionButtons: { flexDirection: 'row', gap: 8, marginLeft: 8, justifyContent: 'flex-end', alignItems: 'center' },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
    },
    filtersCard: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 12,
      padding: 12,
      marginHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    rowFilter: { flexDirection: 'row', gap: 8 },
    filtersActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    pickerLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 6, fontFamily: Fonts.semiBold },
    pickerField: {
      backgroundColor: colors.bgInput,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 8,
    },
    pickerFieldText: { color: colors.textPrimary },
    modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: colors.bgSurface, padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '50%' },
    modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.bgElevated },
    modalOptionText: { fontSize: 16, color: colors.textPrimary },
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
