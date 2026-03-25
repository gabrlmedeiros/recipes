import { Controller, Get, Param, ParseUUIDPipe, Post, Res, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import path from 'path';
import { GetPrintStatusUseCase } from './application/use-cases/get-print-status.use-case';
import { DownloadPrintUseCase } from './application/use-cases/download-print.use-case';
import { CreatePrintJobUseCase } from './application/use-cases/create-print-job.use-case';
import { JwtAuthGuard } from '../auth/application/guards/jwt-auth.guard';

@ApiTags('Impressões')
@Controller('prints')
export class PrintsController {
  constructor(
    private getStatusUseCase: GetPrintStatusUseCase,
    private downloadUseCase: DownloadPrintUseCase,
    private createPrintJobUseCase: CreatePrintJobUseCase,
  ) {}

  @Post(':recipeId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar trabalho de impressão para uma receita' })
  @ApiResponse({ status: 201, description: 'Trabalho de impressão criado' })
  async create(@Param('recipeId', ParseUUIDPipe) recipeId: string, @Request() req: any) {
    const userId = req.user?.id as string | undefined;
    const job = await this.createPrintJobUseCase.execute(recipeId, userId);
    return { data: { jobId: job.id }, error: null };
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Obter status de um trabalho de impressão' })
  @ApiResponse({ status: 200, description: 'Status do trabalho de impressão' })
  async status(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.getStatusUseCase.execute(id);
    return { data: result, error: null };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Baixar arquivo de impressão (se disponível)' })
  @ApiResponse({ status: 200, description: 'Arquivo retornado' })
  async download(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const filePath = await this.downloadUseCase.execute(id);
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
    }
    return res.sendFile(path.resolve(filePath));
  }
}
