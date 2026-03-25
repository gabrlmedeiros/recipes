import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { api } from '@/shared/services/api';
import { authService } from '@/modules/auth';

jest.mock('../../src/shared/services/api', () => ({
  api: {
    post: jest.fn(),
  },
}));

const mockResponse = {
  data: {
    data: {
      token: 'mock-token',
      user: { id: '1', name: 'João Silva', login: 'joaosilva' },
    },
  },
};

describe('authService (mobile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('chama POST /auth/login e retorna token + usuário', async () => {
      jest.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.login('joaosilva', 'senha123');

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        login: 'joaosilva',
        password: 'senha123',
      }, { headers: { 'X-Platform': 'mobile' } });
      expect(result).toEqual({
        token: 'mock-token',
        user: { id: '1', name: 'João Silva', login: 'joaosilva' },
      });
    });

    it('propaga erro da API quando login falha', async () => {
      const error = { response: { data: { error: { message: 'Login ou senha inválidos', code: 'INVALID_CREDENTIALS' } } } };
      jest.mocked(api.post).mockRejectedValue(error);

      await expect(authService.login('joaosilva', 'senha-errada')).rejects.toMatchObject({
        response: { data: { error: { code: 'INVALID_CREDENTIALS' } } },
      });
    });
  });

  describe('register', () => {
    it('chama POST /auth/register e retorna token + usuário', async () => {
      jest.mocked(api.post).mockResolvedValue(mockResponse);

      const result = await authService.register('João Silva', 'joaosilva', 'senha123');

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'João Silva',
        login: 'joaosilva',
        password: 'senha123',
      }, { headers: { 'X-Platform': 'mobile' } });
      expect(result.token).toBe('mock-token');
      expect(result.user.login).toBe('joaosilva');
    });

    it('propaga erro 409 quando login já está em uso', async () => {
      const error = { response: { status: 409, data: { error: { message: 'Login já está em uso', code: 'LOGIN_TAKEN' } } } };
      jest.mocked(api.post).mockRejectedValue(error);

      await expect(authService.register('Outro', 'joaosilva', 'senha123')).rejects.toMatchObject({
        response: { status: 409 },
      });
    });
  });

  describe('logout', () => {
    it('chama POST /auth/logout', async () => {
      jest.mocked(api.post).mockResolvedValue({ data: { data: { success: true }, error: null } });

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});
