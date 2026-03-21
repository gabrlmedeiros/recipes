import { CreatePrintJobUseCase } from "../application/use-cases/create-print-job.use-case";

describe('CreatePrintJobUseCase', () => {
  let prisma: any;
  let rabbitmq: any;
  let useCase: CreatePrintJobUseCase;

  beforeEach(() => {
    prisma = { printJob: { create: jest.fn() } };
    rabbitmq = { publishPrint: jest.fn() };
    useCase = new CreatePrintJobUseCase(prisma, rabbitmq);
  });

  afterEach(() => jest.restoreAllMocks());

  it('cria um print job e publica a mensagem', async () => {
    const job = { id: 'job1', recipeId: 'r1', requestedBy: 'u1' };
    prisma.printJob.create.mockResolvedValue(job);

    const res = await useCase.execute('r1', 'u1');

    expect(prisma.printJob.create).toHaveBeenCalledWith({ data: { recipeId: 'r1', requestedBy: 'u1' } });
    expect(rabbitmq.publishPrint).toHaveBeenCalledWith('r1', { requestedBy: 'u1', jobId: 'job1' });
    expect(res).toEqual(job);
  });

  it('retorna o job mesmo se a publicação falhar', async () => {
    const job = { id: 'job2', recipeId: 'r2' };
    prisma.printJob.create.mockResolvedValue(job);
    rabbitmq.publishPrint.mockRejectedValue(new Error('boom'));

    const res = await useCase.execute('r2');

    expect(prisma.printJob.create).toHaveBeenCalled();
    expect(rabbitmq.publishPrint).toHaveBeenCalled();
    expect(res).toEqual(job);
  });
});
