import { PrintsController } from '../prints.controller';

describe('PrintsController', () => {
  let controller: PrintsController;
  let mockGetStatusUseCase: Partial<Record<'execute', jest.Mock>>;
  let mockDownloadUseCase: Partial<Record<'execute', jest.Mock>>;
  let mockCreatePrintJobUseCase: Partial<Record<'execute', jest.Mock>>;

  beforeEach(() => {
    mockGetStatusUseCase = { execute: jest.fn() };
    mockDownloadUseCase = { execute: jest.fn() };
    mockCreatePrintJobUseCase = { execute: jest.fn() };

    controller = new PrintsController(
      mockGetStatusUseCase as any,
      mockDownloadUseCase as any,
      mockCreatePrintJobUseCase as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('chama CreatePrintJobUseCase e retorna jobId', async () => {
      const job = { id: 'j-123' };
      (mockCreatePrintJobUseCase.execute as jest.Mock).mockResolvedValue(job);

      const req: any = { user: { id: 'u1' } };
      const res = await controller.create('r-1', req);

      expect(mockCreatePrintJobUseCase.execute).toHaveBeenCalledWith('r-1', 'u1');
      expect(res).toEqual({ data: { jobId: 'j-123' }, error: null });
    });
  });

  describe('status', () => {
    it('retorna status do job', async () => {
      (mockGetStatusUseCase.execute as jest.Mock).mockResolvedValue({ status: 'DONE', filePath: '/tmp/file.pdf' });

      const res = await controller.status('j-1');

      expect(mockGetStatusUseCase.execute).toHaveBeenCalledWith('j-1');
      expect(res).toEqual({ data: { status: 'DONE', filePath: '/tmp/file.pdf' }, error: null });
    });
  });
});
