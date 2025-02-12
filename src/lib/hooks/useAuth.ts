'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AuthStatus {
    isAuthenticated: boolean;
    username: string | null;
    loading: boolean;
}

export interface AuthActions {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

export function useAuth(currentUsername: string) {
    const [status, setStatus] = useState<AuthStatus>({
        isAuthenticated: false,
        username: null,
        loading: true,
    });

    // 使用 useCallback 包装 checkAuth 函数
    const checkAuth = useCallback(async () => {
        try {
            const response = await fetch(`/api/user/${currentUsername}/verify`);
            const data = await response.json();

            setStatus({
                isAuthenticated: data.success,
                username: data.success ? currentUsername : null,
                loading: false,
            });
        } catch (error) {
            console.error('验证登录状态失败:', error);
            setStatus({ isAuthenticated: false, username: null, loading: false });
        }
    }, [currentUsername]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/user/${username}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus({
                    isAuthenticated: true,
                    username,
                    loading: false,
                });
                return true;
            }

            return false;
        } catch (error) {
            console.error('登录失败:', error);
            return false;
        }
    };

    const logout = async () => {
        if (status.username) {
            try {
                await fetch(`/api/user/${status.username}/logout`, {
                    method: 'POST',
                });
            } catch (error) {
                console.error('退出登录失败:', error);
            }
        }
        setStatus({
            isAuthenticated: false,
            username: null,
            loading: false,
        });
    };

    return {
        ...status,
        login,
        logout,
    };
}