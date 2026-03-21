import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from '../recipes.controller';
import { RecipeOwnerGuard } from '../application/guards/recipe-owner.guard';
import { JwtAuthGuard } from '../../auth/application/guards/jwt-auth.guard';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ListRecipesUseCase } from '../application/use-cases/list-recipes.use-case';
import { GetRecipeUseCase } from '../application/use-cases/get-recipe.use-case';
import { CreateRecipeUseCase } from '../application/use-cases/create-recipe.use-case';
import { UpdateRecipeUseCase } from '../application/use-cases/update-recipe.use-case';
import { DeleteRecipeUseCase } from '../application/use-cases/delete-recipe.use-case';
import { GetCategoriesUseCase } from '../application/use-cases/get-categories.use-case';
import { CreatePrintJobUseCase } from '../application/use-cases/create-print-job.use-case';

describe('RecipesController', () => {
  let controller: RecipesController;
  let listUseCase: Partial<Record<'execute', jest.Mock>>;
  let getUseCase: Partial<Record<'execute', jest.Mock>>;
  let createUseCase: Partial<Record<'execute', jest.Mock>>;
  let updateUseCase: Partial<Record<'execute', jest.Mock>>;
  let deleteUseCase: Partial<Record<'execute', jest.Mock>>;
  let categoriesUseCase: Partial<Record<'execute', jest.Mock>>;

  const mockRecipe = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Bolo de Cenoura',
    prepTimeMinutes: 45,
    servings: 8,
    prepMethod: 'Misturar e assar',
    ingredients: ['cenoura', 'ovo', 'farinha'],
    category: { id: 'c1', name: 'Sobremesa' },
  } as any;

  beforeEach(async () => {
    listUseCase = { execute: jest.fn().mockResolvedValue({ items: [mockRecipe], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }) };
    getUseCase = { execute: jest.fn().mockResolvedValue(mockRecipe) };
    createUseCase = { execute: jest.fn().mockResolvedValue(mockRecipe) };
    updateUseCase = { execute: jest.fn().mockResolvedValue({ ...mockRecipe, name: 'Atualizado' }) };
    deleteUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    categoriesUseCase = { execute: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Sobremesa' }]) };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        { provide: ListRecipesUseCase, useValue: listUseCase },
        { provide: GetRecipeUseCase, useValue: getUseCase },
        { provide: CreateRecipeUseCase, useValue: createUseCase },
        { provide: UpdateRecipeUseCase, useValue: updateUseCase },
        { provide: DeleteRecipeUseCase, useValue: deleteUseCase },
        { provide: GetCategoriesUseCase, useValue: categoriesUseCase },
        { provide: CreatePrintJobUseCase, useValue: { execute: jest.fn() } },
        { provide: RecipeOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  it('lista receitas com paginação', async () => {
    const res = await controller.list({ user: { id: 'u1' } } as any, { page: '1', limit: '20' } as any);
    expect(res).toHaveProperty('data');
    expect((res as any).data.items).toHaveLength(1);
  });

  it('retorna categorias', async () => {
    const res = await controller.categories();
    expect(res).toEqual({ data: [{ id: 'c1', name: 'Sobremesa' }], error: null });
  });

  it('retorna receita por id', async () => {
    const res = await controller.get(mockRecipe.id, {} as any);
    expect(res).toEqual({ data: mockRecipe, error: null });
  });

  it('cria receita', async () => {
    const res = await controller.create({ user: { id: 'u1' } } as any, {} as any);
    expect(res).toEqual({ data: mockRecipe, error: null });
  });

  it('atualiza receita', async () => {
    const res = await controller.update(mockRecipe.id, { name: 'Atualizado' } as any);
    expect(res).toEqual({ data: { ...mockRecipe, name: 'Atualizado' }, error: null });
  });

  it('deleta receita', async () => {
    const res = await controller.remove(mockRecipe.id);
    expect(res).toEqual({ data: null, error: null });
  });
});
