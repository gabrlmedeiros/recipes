import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrintsController } from './prints.controller';
import { PrismaPrintsRepository } from './infrastructure/repositories/prisma-prints.repository';
import { PRINTS_REPOSITORY } from './domain/repositories/prints.repository';
import { CreatePrintJobUseCase } from './application/use-cases/create-print-job.use-case';
import { GetPrintStatusUseCase } from './application/use-cases/get-print-status.use-case';
import { DownloadPrintUseCase } from './application/use-cases/download-print.use-case';
import { RabbitMQService } from '../../infrastructure/queue/rabbitmq.service';

@Module({
  imports: [PrismaModule],
  controllers: [PrintsController],
  providers: [
    { provide: PRINTS_REPOSITORY, useClass: PrismaPrintsRepository },
    CreatePrintJobUseCase,
    GetPrintStatusUseCase,
    DownloadPrintUseCase,
    RabbitMQService,
  ],
  exports: [CreatePrintJobUseCase],
})
export class PrintsModule {}
