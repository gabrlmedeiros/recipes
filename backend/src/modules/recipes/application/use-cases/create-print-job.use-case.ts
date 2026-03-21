import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { RabbitMQService } from '../../../../infrastructure/queue/rabbitmq.service';

@Injectable()
export class CreatePrintJobUseCase {
  private readonly logger = new Logger(CreatePrintJobUseCase.name);
  constructor(private prisma: PrismaService, private rabbitmq: RabbitMQService) {}

  async execute(recipeId: string, requestedBy?: string) {
    const job = await (this.prisma as any).printJob.create({ data: { recipeId, requestedBy } });
    try {
      await this.rabbitmq.publishPrint(recipeId, { requestedBy, jobId: job.id });
    } catch (err) {
      this.logger.warn('Failed to enqueue print job, leaving DB record pending', err as any);
    }
    return job;
  }
}
