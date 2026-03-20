import { api } from '../../../services/api';

export interface AuthUser {
  id: string;
  name: string;
  login: string;
}

export const authService = {
  async login(login: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<{ data: AuthUser; error: null }>('/auth/login', { login, password });
    return data.data;
  },

  async register(name: string, login: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<{ data: AuthUser; error: null }>('/auth/register', { name, login, password });
    return data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};
