import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrintsRepository, PRINTS_REPOSITORY } from '../../domain/repositories/prints.repository';

@Injectable()
export class GetPrintStatusUseCase {
  constructor(@Inject(PRINTS_REPOSITORY) private repo: PrintsRepository) {}

  async execute(id: string) {
    const job = await this.repo.findById(id);
    if (!job) throw new NotFoundException();
    return { status: job.status, filePath: job.filePath };
  }
}
