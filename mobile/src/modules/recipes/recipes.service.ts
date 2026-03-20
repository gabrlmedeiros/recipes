import { api } from '../../shared/services/api';

export interface Category {
  id: string;
  name: string;
}

export interface Recipe {
  id: string;
  name: string;
  prepTimeMinutes: number;
  servings: number;
  prepMethod: string;
  ingredients: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  user: { id: string; name: string; login: string };
}

export interface RecipeInput {
  categoryId: string;
  name: string;
  prepTimeMinutes: number;
  servings: number;
  prepMethod: string;
  ingredients: string;
}

export interface PaginatedRecipes {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const recipesService = {
  async list(page = 1, limit = 20, filters?: Record<string, any>): Promise<PaginatedRecipes> {
    const params = { page, limit, ...filters };
    const { data } = await api.get<any>('/recipes', { params });
    const payload = data?.data ?? {};
    const items = payload.items ?? payload.recipes ?? [];
    const pagination = payload.pagination ?? { page, limit, total: 0, totalPages: 0 };
    return { recipes: items, pagination } as PaginatedRecipes;
  },

  async create(input: RecipeInput): Promise<Recipe> {
    const { data } = await api.post<{ data: Recipe }>('/recipes', input);
    return data.data;
  },

  async get(id: string): Promise<Recipe> {
    const { data } = await api.get<{ data: Recipe }>(`/recipes/${id}`);
    return data.data;
  },

  async update(id: string, input: RecipeInput): Promise<Recipe> {
    const { data } = await api.put<{ data: Recipe }>(`/recipes/${id}`, input);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recipes/${id}`);
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get<{ data: Category[] }>('/recipes/categories');
    return data.data;
  },
};
