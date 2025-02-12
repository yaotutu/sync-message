import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthStatus {
    isAuthenticated: boolean;
    username: string | null;
    error: string | null;
    loading: boolean;
    intendedPath: string | null;  // 添加目标路径存储
}

export interface AuthActions {
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    validateAuth: () => Promise<void>;
    setIntendedPath: (path: string) => void;  // 添加设置目标路径的方法
}

export const useAuth = (): AuthStatus & AuthActions => {
    const router = useRouter();
    const [status, setStatus] = useState<AuthStatus>({
        isAuthenticated: false,
        username: null,
        error: null,
        loading: true,
        intendedPath: null
    });

    const validateAuth = async () => {
        const username = localStorage.getItem('username');
        const password = localStorage.getItem('password');

        if (!username || !password) {
            setStatus(prev => ({
                ...prev,
                isAuthenticated: false,
                username: null,
                error: null,
                loading: false
            }));
            return;
        }

        try {
            const response = await fetch('/api/user/verify', {
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();

            setStatus(prev => ({
                ...prev,
                isAuthenticated: data.success,
                username: data.success ? username : null,
                error: data.success ? null : data.message,
                loading: false
            }));

            // 如果验证失败，清除存储的凭证
            if (!data.success) {
                localStorage.removeItem('username');
                localStorage.removeItem('password');
            }
        } catch (error) {
            setStatus(prev => ({
                ...prev,
                isAuthenticated: false,
                username: null,
                error: '验证失败',
                loading: false
            }));
        }
    };

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            setStatus(prev => ({ ...prev, loading: true, error: null }));

            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);

                setStatus(prev => ({
                    ...prev,
                    isAuthenticated: true,
                    username,
                    error: null,
                    loading: false
                }));

                // 登录成功后跳转到之前保存的路径
                if (status.intendedPath) {
                    router.push(status.intendedPath);
                    setStatus(prev => ({ ...prev, intendedPath: null }));  // 清除保存的路径
                }

                return true;
            } else {
                setStatus(prev => ({
                    ...prev,
                    isAuthenticated: false,
                    username: null,
                    error: data.message || '登录失败',
                    loading: false
                }));

                return false;
            }
        } catch (error) {
            setStatus(prev => ({
                ...prev,
                isAuthenticated: false,
                username: null,
                error: '登录失败，请稍后重试',
                loading: false
            }));

            return false;
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/user/logout', {
                method: 'POST'
            });

            localStorage.removeItem('username');
            localStorage.removeItem('password');

            setStatus({
                isAuthenticated: false,
                username: null,
                error: null,
                loading: false,
                intendedPath: null
            });
        } catch (error) {
            console.error('退出登录失败:', error);
            setStatus(prev => ({
                ...prev,
                error: '退出登录失败'
            }));
        }
    };

    const setIntendedPath = (path: string) => {
        setStatus(prev => ({ ...prev, intendedPath: path }));
    };

    useEffect(() => {
        validateAuth();
    }, []);

    return {
        ...status,
        login,
        logout,
        validateAuth,
        setIntendedPath
    };
};