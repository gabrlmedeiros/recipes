import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';

type Props = {
  categories: { id: string; name: string }[];
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterIngredient: string;
  setFilterIngredient: (v: string) => void;
  filterMinPrep: string;
  setFilterMinPrep: (v: string) => void;
  filterMaxPrep: string;
  setFilterMaxPrep: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  order: 'asc' | 'desc';
  setOrder: (v: 'asc' | 'desc') => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
  onApply: () => void;
  onClear: () => void;
};

export default function RecipeSearchFilters(props: Props) {
  const {
    categories,
    filterCategory,
    setFilterCategory,
    filterIngredient,
    setFilterIngredient,
    filterMinPrep,
    setFilterMinPrep,
    filterMaxPrep,
    setFilterMaxPrep,
    sortBy,
    setSortBy,
    order,
    setOrder,
    showFilters,
    setShowFilters,
    onApply,
    onClear,
  } = props;

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);

  function clearAll() {
    setFilterCategory('');
    setFilterIngredient('');
    setFilterMinPrep('');
    setFilterMaxPrep('');
    setSortBy('');
    setOrder('desc');
    onClear();
  }

  function apply() {
    onApply();
    setShowFilters(false);
  }

  function removeFilter(key: string) {
    if (key === 'categoryId') setFilterCategory('');
    if (key === 'ingredient') setFilterIngredient('');
    if (key === 'prepTime') {
      setFilterMinPrep('');
      setFilterMaxPrep('');
    }
    if (key === 'sortBy') setSortBy('');
    if (key === 'order') setOrder('desc');
    onApply();
  }

  const activeFilters: { key: string; label: string }[] = [];
  if (filterCategory) activeFilters.push({ key: 'categoryId', label: `Categoria: ${categories.find(c => c.id === filterCategory)?.name ?? filterCategory}` });
  if (filterIngredient) activeFilters.push({ key: 'ingredient', label: `Ingrediente: ${filterIngredient}` });
  if (filterMinPrep || filterMaxPrep) {
    const min = filterMinPrep || '–';
    const max = filterMaxPrep || '–';
    activeFilters.push({ key: 'prepTime', label: `Tempo: ${min}–${max} min` });
  }
  if (sortBy) {
    const map: Record<string, string> = { createdAt: 'Mais recentes', name: 'Nome', prepTimeMinutes: 'Tempo de preparo' };
    const label = map[sortBy] ?? sortBy;
    activeFilters.push({ key: 'sortBy', label: `Ordenar: ${label} (${order === 'asc' ? 'Asc' : 'Desc'})` });
  }

  return (
    <>
      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {activeFilters.map((f) => (
              <View key={f.key} style={[styles.chip] }>
                <Text style={styles.chipText}>{f.label}</Text>
                <Pressable onPress={() => removeFilter(f.key)} style={({ pressed }) => ({ marginLeft: 8, opacity: pressed ? 0.6 : 1 })}>
                  <Text style={[styles.chipText, { opacity: 0.8 }]}>✕</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Filters panel */}
      {showFilters && (
        <View style={styles.filtersCard}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Filtros</Text>
            <Pressable onPress={() => setShowFilters(false)} style={({ pressed }) => ({ padding: 8, opacity: pressed ? 0.6 : 1 })} accessibilityLabel="Fechar filtros">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.pickerLabel}>Categoria</Text>
          <Pressable style={styles.pickerField} onPress={() => setShowCategoryPicker(true)}>
            <Text style={styles.pickerFieldText}>{categories.find(c => c.id === filterCategory)?.name || 'Selecionar categoria'}</Text>
          </Pressable>

          <AppInput label="Ingrediente" value={filterIngredient} placeholder="Ingrediente" onChangeText={setFilterIngredient} />

          <View style={styles.rowFilter}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput label="Min" value={filterMinPrep} placeholder="Min" onChangeText={setFilterMinPrep} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput label="Max" value={filterMaxPrep} placeholder="Max" onChangeText={setFilterMaxPrep} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.rowFilter}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.pickerLabel}>Ordenar</Text>
              <Pressable style={styles.pickerField} onPress={() => setShowSortPicker(true)}>
                <Text style={styles.pickerFieldText}>{sortBy === 'createdAt' ? 'Mais recentes' : sortBy === 'name' ? 'Nome' : sortBy === 'prepTimeMinutes' ? 'Tempo de preparo' : 'Ordenar'}</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pickerLabel}>Ordem</Text>
              <Pressable style={styles.pickerField} onPress={() => setShowOrderPicker(true)}>
                <Text style={styles.pickerFieldText}>{order === 'asc' ? 'Ascendente' : 'Descendente'}</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.filtersActions}>
            <AppButton title="Aplicar" onPress={apply} />
            <AppButton title="Limpar" variant="ghost" onPress={clearAll} />
          </View>
        </View>
      )}

      {/* Category modal */}
      <Modal visible={showCategoryPicker} transparent animationType="slide" onRequestClose={() => setShowCategoryPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <ScrollView>
                {categories.map((c) => (
                  <Pressable key={c.id} style={styles.modalOption} onPress={() => { setFilterCategory(c.id); setShowCategoryPicker(false); }}>
                    <Text style={styles.modalOptionText}>{c.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      {/* Sort modal */}
      <Modal visible={showSortPicker} transparent animationType="slide" onRequestClose={() => setShowSortPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortPicker(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Pressable style={styles.modalOption} onPress={() => { setSortBy('createdAt'); setShowSortPicker(false); }}><Text style={styles.modalOptionText}>Mais recentes</Text></Pressable>
              <Pressable style={styles.modalOption} onPress={() => { setSortBy('name'); setShowSortPicker(false); }}><Text style={styles.modalOptionText}>Nome</Text></Pressable>
              <Pressable style={styles.modalOption} onPress={() => { setSortBy('prepTimeMinutes'); setShowSortPicker(false); }}><Text style={styles.modalOptionText}>Tempo de preparo</Text></Pressable>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>

      {/* Order modal */}
      <Modal visible={showOrderPicker} transparent animationType="slide" onRequestClose={() => setShowOrderPicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowOrderPicker(false)}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <Pressable style={styles.modalOption} onPress={() => { setOrder('desc'); setShowOrderPicker(false); }}><Text style={styles.modalOptionText}>Descendente</Text></Pressable>
              <Pressable style={styles.modalOption} onPress={() => { setOrder('asc'); setShowOrderPicker(false); }}><Text style={styles.modalOptionText}>Ascendente</Text></Pressable>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
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
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
    closeText: { fontSize: 18, color: colors.textSecondary },
    rowFilter: { flexDirection: 'row', gap: 8 },
    filtersActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    pickerLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 6, fontWeight: '600' },
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
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.bgElevated,
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: { fontSize: 13, color: colors.textSecondary },
  });
}
