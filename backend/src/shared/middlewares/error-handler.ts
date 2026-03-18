import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const statusCode = error.statusCode ?? 500;

  reply.status(statusCode).send({
    data: null,
    error: {
      message: statusCode >= 500 ? 'Internal server error' : error.message,
      code: error.code ?? 'INTERNAL_ERROR',
    },
  });
}
