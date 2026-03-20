import { GetRecipeUseCase } from '../application/use-cases/get-recipe.use-case';

describe('GetRecipeUseCase', () => {
  it('retorna receita por id', async () => {
    const repo = {
      list: jest.fn(),
      getById: jest.fn().mockResolvedValue({ id: 'r1', name: 'X' }),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn(),
    };
    const uc = new GetRecipeUseCase(repo as any);
    const out = await uc.execute('r1');
    expect(repo.getById).toHaveBeenCalledWith('r1');
    expect(out).toMatchObject({ id: 'r1', name: 'X' });
  });
});
