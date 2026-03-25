import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/constants/theme';

type Recipe = any;

function normalizeIngredients(ings: any): string[] {
  if (Array.isArray(ings)) return ings;
  if (typeof ings === 'string') {
    return ings.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeInstructions(ins: any): string[] {
  if (Array.isArray(ins)) return ins.filter(Boolean);
  if (typeof ins === 'string') {
    const trimmed = ins.trim();
    if (!trimmed) return [];
    return trimmed.split(/[.?!;,\r\n]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

export default function RecipeView({ recipe }: { recipe?: Recipe | null }) {
  const { colors } = useTheme();

  if (!recipe) return null;

  const ingredients = normalizeIngredients(recipe?.ingredients);
  const instructions = normalizeInstructions(recipe?.prepMethod);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={[styles.card, { backgroundColor: colors.bgSurface, borderColor: colors.borderPrimary }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: Fonts.bold }]}>{recipe.name}</Text>
          <View style={[styles.categoryPill, { backgroundColor: colors.bgElevated }]}> 
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>{recipe?.category?.name ?? '—'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}> {recipe?.prepTimeMinutes ?? '–'} min</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}> {recipe?.servings ?? '–'} porção{recipe?.servings === 1 ? '' : 'es'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ingredientes</Text>
          {ingredients.length ? (
            ingredients.map((i: string, idx: number) => (
              <Text key={idx} style={[styles.text, { color: colors.textPrimary }]}>• {i}</Text>
            ))
          ) : (
            <Text style={[styles.text, { color: colors.textSecondary }]}>Nenhum ingrediente informado</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Modo de preparo</Text>
          {instructions.length ? (
            instructions.map((p: string, idx: number) => (
              <Text key={idx} style={[styles.text, { color: colors.textPrimary }]}>{p}</Text>
            ))
          ) : (
            <Text style={[styles.text, { color: colors.textSecondary }]}>Nenhuma instrução disponível</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: { marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 2 },
  categoryPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  categoryText: { fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginRight: 14 },
  metaText: { marginLeft: 6, fontSize: 13 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 20 },
});
