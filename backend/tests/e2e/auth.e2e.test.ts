import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';

vi.mock('../../src/shared/database/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { buildApp } from '../../src/app-factory.js';
import { prisma } from '../../src/shared/database/prisma.js';

const mockUser = {
  id: 1,
  name: 'João Silva',
  login: 'joaosilva',
  password: '$2b$10$hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Auth routes — E2E', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp({ logger: false, disableRateLimit: true });
    await app.ready();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  // ─── POST /auth/register ────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('retorna 201 e token ao cadastrar novo usuário', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { name: 'João Silva', login: 'joaosilva', password: 'senha123' },
      });

      expect(response.statusCode).toBe(201);
      const body = response.json<{ data: { token: string; user: { login: string } } }>();
      expect(body.data.token).toBeDefined();
      expect(body.data.user.login).toBe('joaosilva');
    });

    it('retorna 409 quando o login já está em uso', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { name: 'Outro', login: 'joaosilva', password: 'senha123' },
      });

      expect(response.statusCode).toBe(409);
      const body = response.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('LOGIN_TAKEN');
    });

    it('retorna 400 quando o corpo está faltando campos obrigatórios', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { login: 'joaosilva' }, // faltam name e password
      });

      expect(response.statusCode).toBe(400);
      // Schema JSON do Fastify (ajv) rejeita antes do Zod — código nativo do Fastify
      const body = response.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('FST_ERR_VALIDATION');
    });
  });

  // ─── POST /auth/login ────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    it('retorna 200 e token com credenciais válidas', async () => {
      // Registra primeiro para obter um hash real
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const register = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { name: 'João Silva', login: 'joaosilva', password: 'senha123' },
      });

      const registeredUser = register.json<{ data: { user: { id: number; login: string; name: string }; token: string } }>();

      // Agora mock o findUnique com o hash gerado pelo bcrypt do register
      // Como não temos acesso direto ao hash, usamos a mesma rota
      // Em testes e2e com bcrypt real, fazemos login após register usando o create mockado
      // Para isso, precisamos que findUnique retorne o usuário com a senha que o bcrypt gerou
      // Workaround: usar campo password do create call
      const createCall = vi.mocked(prisma.user.create).mock.calls[0]?.[0];
      const hashedPassword = (createCall as { data: { password: string } }).data.password;

      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashedPassword,
      });

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { login: 'joaosilva', password: 'senha123' },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json<{ data: { token: string } }>();
      expect(body.data.token).toBeDefined();
    });

    it('retorna 401 com senha incorreta', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { login: 'joaosilva', password: 'senha-errada' },
      });

      expect(response.statusCode).toBe(401);
      const body = response.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('retorna 401 quando o usuário não existe', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { login: 'naoexiste', password: 'senha123' },
      });

      expect(response.statusCode).toBe(401);
    });

    it('retorna 400 quando o corpo está vazio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  // ─── POST /auth/logout ───────────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    it('retorna 401 sem Authorization header', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
      });

      expect(response.statusCode).toBe(401);
      const body = response.json<{ error: { code: string } }>();
      expect(body.error.code).toBe('MISSING_TOKEN');
    });

    it('retorna 200 e invalida o token com JWT válido', async () => {
      // Gera um token real fazendo login
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const register = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { name: 'João Silva', login: 'joaosilva', password: 'senha123' },
      });

      const { data } = register.json<{ data: { token: string } }>();

      const response = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${data.token}` },
      });

      expect(response.statusCode).toBe(200);
      const body = response.json<{ data: { success: boolean } }>();
      expect(body.data.success).toBe(true);

      // Token deve ser rejeitado em chamadas subsequentes
      const retry = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers: { authorization: `Bearer ${data.token}` },
      });
      expect(retry.statusCode).toBe(401);
      const retryBody = retry.json<{ error: { code: string } }>();
      expect(retryBody.error.code).toBe('INVALID_TOKEN');
    });
  });
});
