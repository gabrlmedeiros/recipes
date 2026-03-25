import { GetPrintStatusUseCase } from '../application/use-cases/get-print-status.use-case';
import { NotFoundException } from '@nestjs/common';

describe('GetPrintStatusUseCase', () => {
  let repo: any;
  let useCase: GetPrintStatusUseCase;

  beforeEach(() => {
    repo = { findById: jest.fn() };
    useCase = new GetPrintStatusUseCase(repo);
  });

  it('retorna status e filePath do job', async () => {
    repo.findById.mockResolvedValue({ id: 'j1', status: 'DONE', filePath: '/tmp/f.pdf' });

    const res = await useCase.execute('j1');

    expect(repo.findById).toHaveBeenCalledWith('j1');
    expect(res).toEqual({ status: 'DONE', filePath: '/tmp/f.pdf' });
  });

  it('lança NotFoundException se job não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('nope')).rejects.toThrow(NotFoundException);
  });
});
