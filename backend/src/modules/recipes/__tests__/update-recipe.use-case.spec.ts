import { UpdateRecipeUseCase } from '../application/use-cases/update-recipe.use-case';

describe('UpdateRecipeUseCase', () => {
  it('chama update do repositório', async () => {
    const repo = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn().mockResolvedValue({ id: 'r1', name: 'Updated' }),
      delete: jest.fn(),
      getCategories: jest.fn(),
    };
    const uc = new UpdateRecipeUseCase(repo as any);
    const out = await uc.execute('r1', { name: 'Updated' });
    expect(repo.update).toHaveBeenCalledWith('r1', { name: 'Updated' });
    expect(out).toMatchObject({ id: 'r1', name: 'Updated' });
  });
});
