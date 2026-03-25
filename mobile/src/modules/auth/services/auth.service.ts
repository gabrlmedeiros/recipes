import { api } from '../../../shared/services/api';

export interface AuthUser {
    id: string;
    name: string;
    login: string;
}

export const authService = {
    async login(login: string, password: string): Promise<{ token: string; user: AuthUser }> {
        const { data } = await api.post<{ data: { token: string; user: AuthUser } }>('/auth/login', { login, password }, { headers: { 'X-Platform': 'mobile' } });
        return data.data;
    },

    async register(name: string, login: string, password: string): Promise<{ token: string; user: AuthUser }> {
        const { data } = await api.post<{ data: { token: string; user: AuthUser } }>('/auth/register', { name, login, password }, { headers: { 'X-Platform': 'mobile' } });
        return data.data;
    },

    async logout(): Promise<void> { await api.post('/auth/logout'); },
};
