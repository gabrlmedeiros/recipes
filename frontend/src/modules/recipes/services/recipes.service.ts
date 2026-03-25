import { api } from '../../../services/api';

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
  items: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type RecipesListFilters = {
  q?: string;
  categoryId?: string;
  ingredient?: string;
  minPrepTime?: number;
  maxPrepTime?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export const recipesService = {
  async list(page = 1, limit = 10, filters?: RecipesListFilters): Promise<PaginatedRecipes> {
    const params: any = { page, limit };
    if (filters) {
      if (filters.q) params.q = filters.q;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.ingredient) params.ingredient = filters.ingredient;
      if (filters.minPrepTime !== undefined) params.minPrepTime = filters.minPrepTime;
      if (filters.maxPrepTime !== undefined) params.maxPrepTime = filters.maxPrepTime;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;
    }
    const { data } = await api.get<{ data: PaginatedRecipes }>('/recipes', { params });
    return data.data;
  },

  async getById(id: string): Promise<Recipe> {
    const { data } = await api.get<{ data: Recipe }>(`/recipes/${id}`);
    return data.data;
  },

  async create(input: RecipeInput): Promise<Recipe> {
    const { data } = await api.post<{ data: Recipe }>('/recipes', input);
    return data.data;
  },

  async update(id: string, input: Partial<RecipeInput>): Promise<Recipe> {
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


export const recipesPrint = {
  async print(id: string): Promise<{ jobId: string } > {
    const { data } = await api.post<{ data: { jobId: string } }>(`/prints/${id}`);
    return data.data;
  },
  async status(jobId: string): Promise<{ status: string; filePath?: string | null }>{
    const { data } = await api.get<{ data: { status: string; filePath?: string | null } }>(`/prints/${jobId}/status`);
    return data.data;
  },
};
export type { Recipe as RecipeType, Category as CategoryType, RecipeInput as RecipeInputType };
