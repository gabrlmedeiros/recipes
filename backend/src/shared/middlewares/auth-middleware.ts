import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';
import { tokenBlacklist } from '../utils/token-blacklist.js';

const JWT_SECRET = process.env['JWT_SECRET'] ?? 'dev_secret';

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Token não fornecido', 'MISSING_TOKEN');
  }

  const token = header.slice(7);

  if (tokenBlacklist.has(token)) {
    throw new AppError(401, 'Token inválido', 'INVALID_TOKEN');
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number };
    request.user = { id: Number(payload.sub), token };
  } catch {
    throw new AppError(401, 'Token inválido ou expirado', 'INVALID_TOKEN');
  }
}
