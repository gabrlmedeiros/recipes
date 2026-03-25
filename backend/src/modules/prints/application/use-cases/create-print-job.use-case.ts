import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrintsRepository, PRINTS_REPOSITORY } from '../../domain/repositories/prints.repository';
import { RabbitMQService } from '../../../../infrastructure/queue/rabbitmq.service';

@Injectable()
export class CreatePrintJobUseCase {
  private readonly logger = new Logger(CreatePrintJobUseCase.name);

  constructor(
    @Inject(PRINTS_REPOSITORY) private repo: PrintsRepository,
    private rabbitmq: RabbitMQService,
  ) {}

  async execute(recipeId: string, requestedBy?: string) {
    const job = await this.repo.create({ recipeId, requestedBy });
    try {
      await this.rabbitmq.publishPrint(recipeId, { requestedBy, jobId: job.id });
    } catch (err) {
      this.logger.warn('Failed to enqueue print job, leaving DB record pending', err as any);
    }
    return job;
  }
}
