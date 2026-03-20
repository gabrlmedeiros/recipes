import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from '../recipes.controller';
import { RecipeOwnerGuard } from '../recipe-owner.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { RecipesService } from '../recipes.service';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: Partial<RecipesService>;

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
    service = {
      list: jest.fn().mockResolvedValue({ recipes: [mockRecipe], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } }),
      get: jest.fn().mockResolvedValue(mockRecipe),
      create: jest.fn().mockResolvedValue(mockRecipe),
      update: jest.fn().mockResolvedValue({ ...mockRecipe, name: 'Atualizado' }),
      delete: jest.fn().mockResolvedValue(undefined),
      getCategories: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Sobremesa' }]),
    } as Partial<RecipesService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        { provide: RecipesService, useValue: service },
        { provide: RecipeOwnerGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: JwtAuthGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
  });

  it('lista receitas com paginação', async () => {
    const res = await controller.list({ user: { id: 'u1' } } as any, '1', '20');
    expect(res).toHaveProperty('data');
    expect((res as any).data.recipes).toHaveLength(1);
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
