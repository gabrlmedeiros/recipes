import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService, type AuthUser } from '../modules/auth';

function loadInitialAuth(): { user: AuthUser | null } {
  const storedUser = localStorage.getItem('user');
  try {
    return { user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null };
  } catch {
    return { user: null };
  }
}

export const useAuthStore = defineStore('auth', () => {
  const initial = loadInitialAuth();
  const user = ref<AuthUser | null>(initial.user);

  const isAuthenticated = computed(() => !!user.value);

  function setAuth(newUser: AuthUser) {
    user.value = newUser;
    localStorage.setItem('user', JSON.stringify(newUser));
  }

  function logout() {
    user.value = null;
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
    setAuth(result);
  }

  async function register(name: string, login: string, password: string) {
    const result = await authService.register(name, login, password);
    setAuth(result);
  }

  return { user, isAuthenticated, login, register, logout, logoutAsync };
});
