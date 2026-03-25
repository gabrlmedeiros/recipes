import { PrintJob, PrintJobStatus } from '../entities/print-job.entity';

export interface PrintsRepository {
  findById(id: string): Promise<PrintJob | null>;
  create(data: { recipeId: string; requestedBy?: string }): Promise<PrintJob>;
  updateStatus(id: string, data: { status: PrintJobStatus; filePath?: string; error?: string }): Promise<PrintJob>;
}

export const PRINTS_REPOSITORY = 'PRINTS_REPOSITORY';
