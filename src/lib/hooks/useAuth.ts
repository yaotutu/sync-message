'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../api-client';

interface User {
    username: string;
    id: string;
    role: 'user' | 'admin';
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data: T;
}

interface AuthResponse {
    user: User;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // 检查登录状态
    useEffect(() => {
        apiClient.get<ApiResponse<AuthResponse>>('/api/auth/verify').then(res => {
            if (res.success) {
                setUser(res.data.user);
            }
        });
    }, []);

    // 登录
    const login = async (username: string, password: string) => {
        const res = await apiClient.post<ApiResponse<AuthResponse>>('/api/auth/login', { username, password });
        if (res.success) {
            setUser(res.data.user);
        }
        return res;
    };

    // 退出登录
    const logout = async () => {
        await apiClient.post('/api/auth/logout');
        setUser(null);
        router.replace('/login');
    };

    return {
        user,
        login,
        logout,
        isAuthenticated: !!user
    };
}