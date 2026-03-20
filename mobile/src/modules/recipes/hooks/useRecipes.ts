import { useState } from 'react';
import { recipesService, type Recipe, type RecipeInput, type PaginatedRecipes } from '@/modules/recipes/recipes.service';

export function useRecipes() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [pagination, setPagination] = useState<PaginatedRecipes['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(page = 1, limit = 20) {
    setLoading(true);
    setError(null);
    try {
      const res = await recipesService.list(page, limit);
      setItems(res.recipes);
      setPagination(res.pagination);
      return res;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar receitas');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function get(id: string) {
    setLoading(true);
    setError(null);
    try {
      const r = await recipesService.get(id);
      return r;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao obter receita');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function getCategories() {
    setLoading(true);
    setError(null);
    try {
      const cats = await recipesService.getCategories();
      return cats;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao carregar categorias');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function create(input: RecipeInput) {
    setLoading(true);
    setError(null);
    try {
      const r = await recipesService.create(input);
      return r;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao criar receita');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function update(id: string, input: RecipeInput) {
    setLoading(true);
    setError(null);
    try {
      const r = await recipesService.update(id, input);
      return r;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao atualizar receita');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    setLoading(true);
    setError(null);
    try {
      await recipesService.delete(id);
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao deletar receita');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { items, pagination, loading, error, load, get, getCategories, create, update, remove };
}

export default useRecipes;
