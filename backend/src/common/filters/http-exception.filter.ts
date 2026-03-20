import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse() as any;
      const message = payload?.message ?? exception.message;
      return response.status(status).json({ data: null, error: { message, code: 'HTTP_ERROR' } });
    }

    // Generic
    console.error('Unhandled exception in NestJS:', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      error: { message: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
    });
  }
}
