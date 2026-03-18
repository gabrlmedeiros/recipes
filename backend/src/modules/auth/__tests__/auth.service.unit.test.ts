import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../auth.repository.js', () => ({
  authRepository: {
    findByLogin: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
  },
}));

import { authService } from '../auth.service.js';
import { authRepository } from '../auth.repository.js';
import bcrypt from 'bcrypt';
import { AppError } from '../../../shared/utils/app-error.js';

const mockUser = {
  id: 1,
  name: 'João Silva',
  login: 'joaosilva',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('authService.register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lança AppError 409 quando o login já está em uso', async () => {
    vi.mocked(authRepository.findByLogin).mockResolvedValue(mockUser);

    await expect(
      authService.register({ name: 'Outro', login: 'joaosilva', password: '123456' }),
    ).rejects.toThrow(AppError);

    await expect(
      authService.register({ name: 'Outro', login: 'joaosilva', password: '123456' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'LOGIN_TAKEN' });
  });

  it('cria o usuário e retorna token + dados do usuário quando login está disponível', async () => {
    vi.mocked(authRepository.findByLogin).mockResolvedValue(null);
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    vi.mocked(authRepository.create).mockResolvedValue(mockUser);

    const result = await authService.register({
      name: 'João Silva',
      login: 'joaosilva',
      password: 'senha123',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    expect(authRepository.create).toHaveBeenCalledWith({
      name: 'João Silva',
      login: 'joaosilva',
      password: 'hashed-password',
    });
    expect(result).toMatchObject({
      token: 'mock-jwt-token',
      user: { id: 1, name: 'João Silva', login: 'joaosilva' },
    });
  });
});

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lança AppError 401 quando o usuário não existe', async () => {
    vi.mocked(authRepository.findByLogin).mockResolvedValue(null);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ login: 'naoexiste', password: 'senha123' }),
    ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('lança AppError 401 quando a senha está incorreta', async () => {
    vi.mocked(authRepository.findByLogin).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      authService.login({ login: 'joaosilva', password: 'senha-errada' }),
    ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('retorna token + dados do usuário com credenciais válidas', async () => {
    vi.mocked(authRepository.findByLogin).mockResolvedValue(mockUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const result = await authService.login({ login: 'joaosilva', password: 'senha123' });

    expect(result).toMatchObject({
      token: 'mock-jwt-token',
      user: { id: 1, name: 'João Silva', login: 'joaosilva' },
    });
  });
});
