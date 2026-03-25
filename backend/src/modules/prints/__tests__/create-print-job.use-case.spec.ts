import { CreatePrintJobUseCase } from '../application/use-cases/create-print-job.use-case';

describe('CreatePrintJobUseCase', () => {
  let repo: any;
  let rabbitmq: any;
  let useCase: CreatePrintJobUseCase;

  beforeEach(() => {
    repo = { create: jest.fn() };
    rabbitmq = { publishPrint: jest.fn() };
    useCase = new CreatePrintJobUseCase(repo, rabbitmq);
  });

  afterEach(() => jest.restoreAllMocks());

  it('cria um print job e publica a mensagem', async () => {
    const job = { id: 'job1', recipeId: 'r1', requestedBy: 'u1' };
    repo.create.mockResolvedValue(job);

    const res = await useCase.execute('r1', 'u1');

    expect(repo.create).toHaveBeenCalledWith({ recipeId: 'r1', requestedBy: 'u1' });
    expect(rabbitmq.publishPrint).toHaveBeenCalledWith('r1', { requestedBy: 'u1', jobId: 'job1' });
    expect(res).toEqual(job);
  });

  it('retorna o job mesmo se a publicação falhar', async () => {
    const job = { id: 'job2', recipeId: 'r2' };
    repo.create.mockResolvedValue(job);
    rabbitmq.publishPrint.mockRejectedValue(new Error('boom'));

    const res = await useCase.execute('r2');

    expect(repo.create).toHaveBeenCalled();
    expect(rabbitmq.publishPrint).toHaveBeenCalled();
    expect(res).toEqual(job);
  });
});
