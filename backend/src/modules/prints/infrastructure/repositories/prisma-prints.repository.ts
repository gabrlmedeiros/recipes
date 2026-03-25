import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PrintsRepository } from '../../domain/repositories/prints.repository';
import { PrintJob, PrintJobStatus } from '../../domain/entities/print-job.entity';

@Injectable()
export class PrismaPrintsRepository implements PrintsRepository {
  constructor(private prisma: PrismaService) {}

  private toDomain(r: any): PrintJob {
    return {
      id: String(r.id),
      recipeId: String(r.recipeId),
      status: r.status,
      filePath: r.filePath ?? null,
      error: r.error ?? null,
      requestedBy: r.requestedBy ?? null,
      createdAt: r.createdAt?.toISOString?.() ?? String(r.createdAt),
      updatedAt: r.updatedAt?.toISOString?.() ?? String(r.updatedAt),
    };
  }

  async findById(id: string): Promise<PrintJob | null> {
    const r = await this.prisma.printJob.findUnique({ where: { id } });
    if (!r) return null;
    return this.toDomain(r);
  }

  async create(data: { recipeId: string; requestedBy?: string }): Promise<PrintJob> {
    const r = await this.prisma.printJob.create({ data: { recipeId: data.recipeId, requestedBy: data.requestedBy } });
    return this.toDomain(r);
  }

  async updateStatus(id: string, data: { status: PrintJobStatus; filePath?: string; error?: string }): Promise<PrintJob> {
    const r = await this.prisma.printJob.update({ where: { id }, data });
    return this.toDomain(r);
  }
}
