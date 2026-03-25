export type PrintJobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export interface PrintJob {
  id: string;
  recipeId: string;
  status: PrintJobStatus;
  filePath: string | null;
  error: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
