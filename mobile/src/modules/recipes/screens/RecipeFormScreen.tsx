import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { type Category, type RecipeInput, type Recipe } from '../services/recipes.service';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/modules/recipes';

export default function RecipeFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id?: string };
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const { get, getCategories, create, update, loading } = useRecipes();
  const [error, setError] = useState('');

  const [form, setForm] = useState<RecipeInput>({
    categoryId: '',
    name: '',
    prepTimeMinutes: 0,
    servings: 0,
    prepMethod: '',
    ingredients: '',
  });

  useEffect(() => {
    getCategories()
      .then((cats) => setCategories(cats))
      .catch(() => setError('Erro ao carregar categorias'));
  }, []);

  useEffect(() => {
    if (!id) return;
    get(id)
      .then((r: Recipe | null | undefined) => {
        if (!r) {
          setError('Receita não encontrada');
          return;
        }

        setForm({
          categoryId: r.category?.id ?? '',
          name: r.name ?? '',
          prepTimeMinutes: r.prepTimeMinutes ?? 0,
          servings: r.servings ?? 0,
          prepMethod: r.prepMethod ?? '',
          ingredients: r.ingredients ?? '',
        });
      })
      .catch((err) => {
        const status = err?.response?.status;
        const msg = err?.response?.data?.error?.message ?? err?.message ?? 'Erro ao carregar receita';
        setError(status ? `${status} - ${msg}` : msg);
      });
  }, [id]);

  function isUuid(val?: string) {
    if (!val) return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val);
  }

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar receita' : 'Nova receita', headerBackTitle: 'Receitas' });
  }, [id, navigation]);

  function setField<K extends keyof RecipeInput>(key: K, value: RecipeInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setError('');
    if (!form.name || form.name.trim().length === 0) {
      setError('O nome da receita é obrigatório.');
      return;
    }
    try {
      console.log('Submitting recipe', form);
      if (id) {
        if (!isUuid(id as string)) {
          throw new Error('ID inválido: deve ser um UUID');
        }
        await update(id as string, form as RecipeInput);
      } else {
        await create(form as RecipeInput);
      }
      router.back();
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      const apiMessage = err.response?.data?.error?.message;
      const msg = apiMessage ?? 'Erro ao criar receita. Tente novamente.';
      setError(msg);
      Alert.alert('Erro', msg);
    }
  }

  const { colors } = useTheme();
  const styles = makeStyles(colors);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <AppInput
            label="Nome da receita"
            value={form.name}
            onChangeText={(v) => setField('name', v)}
            placeholder="Ex: Bolo de cenoura"
          />

          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categoryList}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setField('categoryId', cat.id)}
                  style={[styles.categoryChip, form.categoryId === cat.id && styles.categoryChipActive]}
                >
                  <Text
                    style={[styles.categoryChipText, form.categoryId === cat.id && styles.categoryChipTextActive]}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <AppInput
                label="Tempo de preparo (min)"
                value={form.prepTimeMinutes > 0 ? String(form.prepTimeMinutes) : ''}
                onChangeText={(v) => setField('prepTimeMinutes', Number(v) || 0)}
                placeholder="Ex: 60"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowItem}>
              <AppInput
                label="Porções"
                value={form.servings > 0 ? String(form.servings) : ''}
                onChangeText={(v) => setField('servings', Number(v) || 0)}
                placeholder="Ex: 4"
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Ingredientes"
            value={form.ingredients}
            onChangeText={(v) => setField('ingredients', v)}
            placeholder="Liste os ingredientes..."
            multiline
            numberOfLines={4}
            style={styles.textarea}
          />

          <AppInput
            label="Modo de preparo"
            value={form.prepMethod}
            onChangeText={(v) => setField('prepMethod', v)}
            placeholder="Descreva o passo a passo..."
            multiline
            numberOfLines={5}
            style={styles.textarea}
          />

          {!!error && <Text style={styles.errorBox}>{error}</Text>}

          <AppButton title={id ? 'Salvar alterações' : 'Criar receita'} loading={loading} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bgPage },
    container: { padding: 24, paddingBottom: 40 },
    card: {
      backgroundColor: colors.bgSurface,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      borderRadius: 16,
      padding: 24,
      gap: 20,
    },
    field: { gap: 8 },
    label: {
      fontSize: 11,
      fontFamily: Fonts.semiBold,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoryChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.borderPrimary,
      backgroundColor: colors.bgInput,
    },
    categoryChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    categoryChipText: {
      fontSize: 12,
      fontFamily: Fonts.regular,
      color: colors.textSecondary,
    },
    categoryChipTextActive: {
      color: colors.primaryForeground,
      fontFamily: Fonts.semiBold,
    },
    row: { flexDirection: 'row', gap: 12 },
    rowItem: { flex: 1 },
    textarea: { height: 100, textAlignVertical: 'top', paddingTop: 12, color: colors.textPrimary },
    errorBox: {
      fontSize: 12,
      color: colors.destructive,
      textAlign: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: `${colors.destructive}15`,
    },
  });
}
