import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service.js';
import { registerSchema, loginSchema } from './auth.schemas.js';
import { tokenBlacklist } from '../../shared/utils/token-blacklist.js';

export const authController = {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const input = registerSchema.parse(request.body);
    const result = await authService.register(input);
    return reply.status(201).send({ data: result, error: null });
  },

  async login(request: FastifyRequest, reply: FastifyReply) {
    const input = loginSchema.parse(request.body);
    const result = await authService.login(input);
    return reply.send({ data: result, error: null });
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    tokenBlacklist.add(request.user.token);
    return reply.send({ data: { success: true }, error: null });
  },
};
