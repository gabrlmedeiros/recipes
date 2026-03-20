import { useState } from 'react';
import { authService, type AuthUser } from '@/modules/auth/auth.service';
import { storage } from '@/shared/storage/storage';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(login: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { token, user: u } = await authService.login(login, password);
      await storage.setToken(token);
      setUser(u);
      return u;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao autenticar');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, loginStr: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { token, user: u } = await authService.register(name, loginStr, password);
      await storage.setToken(token);
      setUser(u);
      return u;
    } catch (e: any) {
      setError(e?.message ?? 'Erro ao registrar');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      await storage.removeToken();
      setUser(null);
      setLoading(false);
    }
  }

  return { user, loading, error, login, register, logout, setUser };
}

export default useAuth;
