import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../utils/app-error.js';

export function errorHandler(
  error: FastifyError | ZodError | AppError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      data: null,
      error: {
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message })),
      },
    });
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      data: null,
      error: { message: error.message, code: error.code },
    });
  }

  const statusCode = (error as FastifyError).statusCode ?? 500;
  reply.status(statusCode).send({
    data: null,
    error: {
      message: statusCode >= 500 ? 'Erro interno do servidor' : error.message,
      code: (error as FastifyError).code ?? 'INTERNAL_ERROR',
    },
  });
}
