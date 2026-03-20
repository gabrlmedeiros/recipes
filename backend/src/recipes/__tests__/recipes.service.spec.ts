import { RecipesService } from '../recipes.service';

function makePrismaMock() {
  return {
    recipe: {
      findMany: jest.fn().mockResolvedValue([{ id: '1', name: 'r1' }]),
      findUnique: jest.fn().mockResolvedValue({ id: '1', name: 'r1' }),
      create: jest.fn().mockResolvedValue({ id: '2', name: 'new', category: { id: 'c1', name: 'Cat' } }),
      update: jest.fn().mockResolvedValue({ id: '1', name: 'u', category: { id: 'c1', name: 'Cat' } }),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(1),
    },
    category: {
      findMany: jest.fn().mockResolvedValue([{ id: 'c1', name: 'Cat' }]),
    },
  } as any;
}

describe('Serviço de receitas', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let svc: RecipesService;

  beforeEach(() => {
    prisma = makePrismaMock();
    svc = new RecipesService(prisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('list retorna recipes e paginação corretamente', async () => {
    (prisma.recipe.count as jest.Mock).mockResolvedValue(5);

    const res = await svc.list(2, 2);

    expect(prisma.recipe.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 2, take: 2 }));
    expect(prisma.recipe.count).toHaveBeenCalled();
    expect(res.recipes).toBeDefined();
    expect(res.pagination).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: Math.ceil(5 / 2) });
  });

  it('list filtra por userId quando informado', async () => {
    (prisma.recipe.count as jest.Mock).mockResolvedValue(2);

    const res = await svc.list(1, 10, 'user-123');

    expect(prisma.recipe.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-123' } }));
    expect(prisma.recipe.count).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'user-123' } }));
    expect(res.pagination.total).toBe(2);
  });

  it('get retorna receita por id quando existe', async () => {
    (prisma.recipe.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'r1', category: { id: 'c1', name: 'Cat' } });

    const result = await svc.get('1');

    expect(prisma.recipe.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: { category: true, user: true } });
    expect(result).toMatchObject({ id: '1', name: 'r1' });
  });

  it('get retorna null quando não existe', async () => {
    (prisma.recipe.findUnique as jest.Mock).mockResolvedValue(null);
    const result = await svc.get('no-exist');
    expect(result).toBeNull();
  });

  it('create cria receita e retorna com categoria', async () => {
    const input: any = { name: 'Nova', categoryId: 'c1', prepTimeMinutes: 10, servings: 2, prepMethod: 'x', ingredients: 'y' };

    (prisma.recipe.create as jest.Mock).mockResolvedValue({ id: '10', ...input, category: { id: 'c1', name: 'Cat' } });

    const created = await svc.create(input, '00000000-0000-0000-0000-000000000099');

    expect(prisma.recipe.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'Nova', categoryId: 'c1' }),
      include: { category: true },
    }));

    expect(created).toMatchObject({ id: '10', name: 'Nova', category: { id: 'c1', name: 'Cat' } });
  });

  it('create associa userId passado', async () => {
    const input: any = { name: 'D', categoryId: 'c1' };
    (prisma.recipe.create as jest.Mock).mockResolvedValue({ id: '11', ...input, category: { id: 'c1', name: 'Cat' } });

    await svc.create(input, 'user-xyz');

    expect(prisma.recipe.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ userId: 'user-xyz' }) }));
  });

  it('update atualiza e retorna receita', async () => {
    (prisma.recipe.update as jest.Mock).mockResolvedValue({ id: '1', name: 'updated', category: { id: 'c1', name: 'Cat' } });

    const res = await svc.update('1', { name: 'updated' });

    expect(prisma.recipe.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: '1' }, data: expect.objectContaining({ name: 'updated' }), include: { category: true } }));
    expect(res).toMatchObject({ id: '1', name: 'updated' });
  });

  it('delete remove a receita', async () => {
    (prisma.recipe.delete as jest.Mock).mockResolvedValue({});

    const res = await svc.delete('1');

    expect(prisma.recipe.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(res).toBeUndefined();
  });

  it('getCategories retorna lista de categorias', async () => {
    (prisma.category.findMany as jest.Mock).mockResolvedValue([{ id: 'c1', name: 'A' }, { id: 'c2', name: 'B' }]);

    const cats = await svc.getCategories();

    expect(prisma.category.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    expect(Array.isArray(cats)).toBe(true);
    expect(cats).toHaveLength(2);
  });
});
