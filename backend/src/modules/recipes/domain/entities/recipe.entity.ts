export interface Category {
  id: string;
  name: string;
}

export interface UserRef {
  id: string;
  name: string;
  login: string;
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
  category?: Category | null;
  user?: UserRef | null;
}
