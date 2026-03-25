import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation, useFocusEffect } from 'expo-router';
import { api } from '@/shared/services/api';
import { useTheme } from '@/hooks/use-theme';
import RecipeView from '../components/RecipeView';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams() as { id?: string };
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any | null>(null);
  const [error, setError] = useState('');
  const { colors } = useTheme();

  const styles = makeStyles(colors);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let mounted = true;
      setLoading(true);
      api.get(`/recipes/${id}`).then((res) => {
        if (mounted) setRecipe(res.data.data);
      }).catch((e) => {
        if (mounted) setError('Erro ao carregar receita.');
      }).finally(() => {
        if (mounted) setLoading(false);
      });
      return () => {
        mounted = false;
      };
    }, [id]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push(`/recipe-form/${id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 8 })}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Editar</Text>
        </Pressable>
      ),
    });
  }, [navigation, id, router, colors]);

  if (loading) {
    return (
      <View style={[styles.flex, styles.center, { backgroundColor: colors.bgPage }]}> 
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.flex, styles.center, { padding: 24, backgroundColor: colors.bgPage }]}> 
        <Text style={{ color: colors.destructive }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.bgPage }]}>
      <RecipeView recipe={recipe} />
    </ScrollView>
  );
}

function makeStyles(colors: any) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.bgPage },
    center: { justifyContent: 'center', alignItems: 'center' },
    container: { padding: 16, paddingBottom: 40, backgroundColor: colors.bgPage },
  });
}
