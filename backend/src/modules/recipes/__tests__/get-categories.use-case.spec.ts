import { GetCategoriesUseCase } from '../application/use-cases/get-categories.use-case';

describe('GetCategoriesUseCase', () => {
  it('retorna categorias', async () => {
    const repo = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Sobremesa' }]),
    };
    const uc = new GetCategoriesUseCase(repo as any);
    const out = await uc.execute();
    expect(repo.getCategories).toHaveBeenCalled();
    expect(out).toMatchObject([{ id: 'c1', name: 'Sobremesa' }]);
  });
});
