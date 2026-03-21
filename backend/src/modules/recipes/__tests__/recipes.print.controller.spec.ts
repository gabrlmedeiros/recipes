import { RecipesController } from '../../recipes/recipes.controller';

describe('RecipesController (print)', () => {
  let controller: RecipesController;
  let mockCreatePrintJobUseCase: Partial<Record<'execute', jest.Mock>>;

  beforeEach(() => {
    mockCreatePrintJobUseCase = { execute: jest.fn() };

    controller = new RecipesController({} as any, {} as any, {} as any, {} as any, {} as any, {} as any, mockCreatePrintJobUseCase as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('impressão', () => {
    it('chama CreatePrintJobUseCase e retorna jobId', async () => {
      const job = { id: 'j-123' };
      (mockCreatePrintJobUseCase.execute as jest.Mock).mockResolvedValue(job);

      const req: any = { user: { id: 'u1' } };
      const res = await controller.print('r-1', req);

      expect(mockCreatePrintJobUseCase.execute).toHaveBeenCalledWith('r-1', 'u1');
      expect(res).toEqual({ data: { jobId: 'j-123' }, error: null });
    });
  });
});
