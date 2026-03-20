import { ListRecipesUseCase } from '../application/use-cases/list-recipes.use-case';

describe('ListRecipesUseCase', () => {
  it('retorna paginação e encaminha filtros', async () => {
    const repo = {
      list: jest.fn().mockResolvedValue({ items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } }),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn(),
    };
    const uc = new ListRecipesUseCase(repo as any);
    const filters = { q: 'tomato', categoryId: 'c1' };
    const out = await uc.execute(1, 10, 'user-1', filters as any);
    expect(repo.list).toHaveBeenCalledWith(1, 10, 'user-1', filters);
    expect(out).toHaveProperty('items');
    expect(out.pagination.page).toBe(1);
  });
});
