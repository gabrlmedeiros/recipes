import { api } from '../../shared/services/api';

export interface AuthUser {
    id: number;
    name: string;
    login: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export const authService = {
    async login(login: string, password: string): Promise<AuthResponse> {
        const { data } = await api.post<{ data: AuthResponse }>('/auth/login', { login, password });
        return data.data;
    },

    async register(name: string, login: string, password: string): Promise<AuthResponse> { const { data } = await api.post<{ data: AuthResponse }>('/auth/register', { name, login, password }); return data.data; }, async logout(): Promise<void> { await api.post('/auth/logout'); },
};
