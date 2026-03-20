import { CreateRecipeUseCase } from '../application/use-cases/create-recipe.use-case';

describe('CreateRecipeUseCase', () => {
  it('chama create do repositório', async () => {
    const repo = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn().mockResolvedValue({ id: 'r1', name: 'X' }),
      update: jest.fn(),
      delete: jest.fn(),
      getCategories: jest.fn(),
    };
    const uc = new CreateRecipeUseCase(repo as any);
    const out = await uc.execute({ name: 'X', categoryId: 'c1', prepTimeMinutes: 10, servings: 2, prepMethod: 'm', ingredients: 'i' }, 'u1');
    expect(repo.create).toHaveBeenCalled();
    expect(out).toMatchObject({ id: 'r1', name: 'X' });
  });
});
