import { Controller, Get, Param, ParseUUIDPipe, Res, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

@Controller('prints')
export class PrintsController {
  constructor(private prisma: PrismaService) {}

  @Get(':id/status')
  async status(@Param('id', ParseUUIDPipe) id: string) {
    const job = await this.prisma.printJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException();
    return { data: { status: job.status, filePath: job.filePath ?? null }, error: null };
  }

  @Get(':id/download')
  async download(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const job = await this.prisma.printJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException();
    if (job.status !== 'DONE' || !job.filePath) {
      throw new NotFoundException('File not ready');
    }
    try {
      await fs.access(job.filePath);
    } catch (err) {
      throw new NotFoundException('File not found');
    }
    if (job.filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${path.basename(job.filePath)}"`);
    }
    return res.sendFile(path.resolve(job.filePath));
  }
}
