import { Recipe } from '../entities/recipe.entity';

export interface Paginated<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export type CreateRecipeData = {
  userId: string;
  categoryId?: string;
  name: string;
  prepTimeMinutes: number;
  servings: number;
  prepMethod: string;
  ingredients: string;
};

export type RecipesFilters = {
  q?: string;
  categoryId?: string;
  ingredient?: string;
  minPrepTime?: number;
  maxPrepTime?: number;
  sortBy?: 'name' | 'createdAt' | 'prepTimeMinutes';
  order?: 'asc' | 'desc';
};

export interface RecipesRepository {
  list(page: number, limit: number, userId?: string, filters?: RecipesFilters): Promise<Paginated<Recipe>>;
  getById(id: string): Promise<Recipe | null>;
  create(input: CreateRecipeData): Promise<Recipe>;
  update(id: string, input: Partial<Recipe>): Promise<Recipe>;
  delete(id: string): Promise<void>;
  getCategories(): Promise<{ id: string; name: string }[]>;
}

export const RECIPES_REPOSITORY = 'RECIPES_REPOSITORY';
