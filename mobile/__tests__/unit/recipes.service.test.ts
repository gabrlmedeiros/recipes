import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { recipesService } from '../../src/modules/recipes/services/recipes.service';
import { api } from '@/shared/services/api';

jest.mock('../../src/shared/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockCategory = { id: '1', name: 'Almoço' };

const mockRecipe = {
  id: '1',
  name: 'Bolo de cenoura',
  prepTimeMinutes: 60,
  servings: 8,
  prepMethod: 'Misture tudo e asse.',
  ingredients: '2 cenouras, 3 ovos',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  category: mockCategory,
  user: { id: '1', name: 'João Silva', login: 'joaosilva' },
};

const mockPaginatedResponse = {
  data: {
    data: {
      recipes: [mockRecipe],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    },
  },
};

describe('recipesService (mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── list ─────────────────────────────────────────────────────────────────────

  describe('list', () => {
    it('chama GET /recipes com page e limit e retorna dados paginados', async () => {
      jest.mocked(api.get).mockResolvedValue(mockPaginatedResponse);

      const result = await recipesService.list(1, 20);

      expect(api.get).toHaveBeenCalledWith('/recipes', { params: { page: 1, limit: 20 } });
      expect(result.recipes).toHaveLength(1);
      expect(result.recipes[0]?.name).toBe('Bolo de cenoura');
      expect(result.pagination).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('usa page=1 e limit=20 como padrão', async () => {
      jest.mocked(api.get).mockResolvedValue(mockPaginatedResponse);

      await recipesService.list();

      expect(api.get).toHaveBeenCalledWith('/recipes', { params: { page: 1, limit: 20 } });
    });

    it('propaga erro da API quando requisição falha', async () => {
      const error = { response: { status: 401, data: { error: { message: 'Não autorizado' } } } };
      jest.mocked(api.get).mockRejectedValue(error);

      await expect(recipesService.list()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────────

  describe('create', () => {
    const recipeInput = {
      categoryId: '1',
      name: 'Bolo de cenoura',
      prepTimeMinutes: 60,
      servings: 8,
      prepMethod: 'Misture tudo e asse.',
      ingredients: '2 cenouras, 3 ovos',
    };

    it('chama POST /recipes e retorna a receita criada', async () => {
      jest.mocked(api.post).mockResolvedValue({ data: { data: mockRecipe } });

      const result = await recipesService.create(recipeInput);

      expect(api.post).toHaveBeenCalledWith('/recipes', recipeInput);
      expect(result).toEqual(mockRecipe);
    });

    it('propaga erro 400 quando payload é inválido', async () => {
      const error = { response: { status: 400, data: { error: { message: 'Validação falhou' } } } };
      jest.mocked(api.post).mockRejectedValue(error);

      await expect(recipesService.create(recipeInput)).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  // ─── getCategories ────────────────────────────────────────────────────────────

  describe('getCategories', () => {
    it('chama GET /recipes/categories e retorna a lista', async () => {
      jest.mocked(api.get).mockResolvedValue({ data: { data: [mockCategory] } });

      const result = await recipesService.getCategories();

      expect(api.get).toHaveBeenCalledWith('/recipes/categories');
      expect(result).toEqual([mockCategory]);
    });

    it('retorna lista vazia quando não há categorias', async () => {
      jest.mocked(api.get).mockResolvedValue({ data: { data: [] } });

      const result = await recipesService.getCategories();

      expect(result).toHaveLength(0);
    });

    it('propaga erro quando requisição falha', async () => {
      const error = { response: { status: 401 } };
      jest.mocked(api.get).mockRejectedValue(error);

      await expect(recipesService.getCategories()).rejects.toMatchObject({ response: { status: 401 } });
    });
  });
});
