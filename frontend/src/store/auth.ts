import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService, type AuthUser } from '../modules/auth/auth.service';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
}

function loadInitialAuth(): { token: string | null; user: AuthUser | null } {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (!storedToken || isTokenExpired(storedToken)) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
  try {
    return { token: storedToken, user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null };
  } catch {
    return { token: storedToken, user: null };
  }
}

export const useAuthStore = defineStore('auth', () => {
  const initial = loadInitialAuth();
  const token = ref<string | null>(initial.token);
  const user = ref<AuthUser | null>(initial.user);

  const isAuthenticated = computed(() => !!token.value);

  function setAuth(newToken: string, newUser: AuthUser) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function logoutAsync() {
    try {
      await authService.logout();
    } finally {
      logout();
    }
  }

  async function login(login: string, password: string) {
    const result = await authService.login(login, password);
    setAuth(result.token, result.user);
  }

  async function register(name: string, login: string, password: string) {
    const result = await authService.register(name, login, password);
    setAuth(result.token, result.user);
  }

  return { token, user, isAuthenticated, login, register, logout, logoutAsync };
});
