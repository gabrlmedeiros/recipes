import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrintsRepository, PRINTS_REPOSITORY } from '../../domain/repositories/prints.repository';
import fs from 'fs/promises';

@Injectable()
export class DownloadPrintUseCase {
  constructor(@Inject(PRINTS_REPOSITORY) private repo: PrintsRepository) {}

  async execute(id: string): Promise<string> {
    const job = await this.repo.findById(id);
    if (!job) throw new NotFoundException();
    if (job.status !== 'DONE' || !job.filePath) {
      throw new NotFoundException('File not ready');
    }
    try {
      await fs.access(job.filePath);
    } catch {
      throw new NotFoundException('File not found');
    }
    return job.filePath;
  }
}
