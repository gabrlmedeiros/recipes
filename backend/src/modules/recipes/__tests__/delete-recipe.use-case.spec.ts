import { DeleteRecipeUseCase } from '../application/use-cases/delete-recipe.use-case';

describe('DeleteRecipeUseCase', () => {
  it('chama delete do repositório', async () => {
    const repo = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      getCategories: jest.fn(),
    };
    const uc = new DeleteRecipeUseCase(repo as any);
    const out = await uc.execute('r1');
    expect(repo.delete).toHaveBeenCalledWith('r1');
    expect(out).toBeUndefined();
  });
});
