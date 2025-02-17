'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    username: string;
    role?: string;
}

export function useAuth(requiredUsername?: string) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/user/verify', {
                    credentials: 'include'
                });

                const data = await response.json();

                if (!data.success) {
                    setUser(null);
                    if (requiredUsername) {
                        setError(data.message || '未登录');
                    }
                    return;
                }

                if (requiredUsername && data.data?.user?.username !== requiredUsername) {
                    setUser(null);
                    setError('无权访问此页面');
                    return;
                }

                setUser(data.data.user);
                setError(null);
            } catch (err: any) {
                console.error('验证失败:', err);
                setUser(null);
                setError('验证过程中发生错误');
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [requiredUsername]);

    const login = async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '登录失败');
            }

            setUser(data.data.user);
            return data;
        } catch (err: any) {
            setError(err.message || '登录失败');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/logout', {
                method: 'POST',
                credentials: 'include'
            });

            const data = await response.json();
            if (data.success) {
                setUser(null);
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || '登出失败');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        user,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user
    };
}