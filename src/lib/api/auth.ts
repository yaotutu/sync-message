import { apiClient } from '../api-client';

export interface User {
    id: string;
    username: string;
    role: 'user' | 'admin';
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: {
        token?: string;
        user?: User;
    };
}

export const authApi = {
    /**
     * 用户登录
     */
    login: async (username: string, password: string) => {
        return apiClient.post<AuthResponse>('/api/auth/login', {
            username,
            password
        });
    },

    /**
     * 验证当前会话
     */
    verify: async () => {
        return apiClient.get<AuthResponse>('/api/auth/verify');
    }
}; 