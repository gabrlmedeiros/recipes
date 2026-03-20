import { RecipeOwnerGuard } from '../application/guards/recipe-owner.guard';
import { ExecutionContext, HttpException } from '@nestjs/common';

function makePrismaMock() {
  return {
    recipe: {
      findUnique: jest.fn(),
    },
  } as any;
}

function makeContext(user: any, params: any): ExecutionContext {
  return ({
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown) as ExecutionContext;
}

describe('RecipeOwnerGuard', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let guard: RecipeOwnerGuard;

  beforeEach(() => {
    prisma = makePrismaMock();
    guard = new RecipeOwnerGuard(prisma);
  });

  it('permite acesso quando usuário é dono', async () => {
    const recipe = { id: 'r1', userId: 'u1', category: { id: 'c1' } };
    (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(recipe);

    const ctx = makeContext({ id: 'u1' }, { id: 'r1' });
    const res = await guard.canActivate(ctx);
    expect(res).toBe(true);
  });

  it('nega acesso quando não é dono', async () => {
    const recipe = { id: 'r1', userId: 'u1' };
    (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(recipe);

    const ctx = makeContext({ id: 'u2' }, { id: 'r1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
  });

  it('retorna 404 quando receita não existe', async () => {
    (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);
    const ctx = makeContext({ id: 'u1' }, { id: 'missing' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
  });

  it('nega quando usuário não autenticado', async () => {
    const ctx = makeContext(null, { id: 'r1' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(HttpException);
  });
});
