'use client';

import { useAuthContext } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    const auth = useAuthContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 如果已经登录，重定向到用户主页
        if (auth.isAuthenticated && auth.username) {
            router.push(`/user/${auth.username}/cardkeys`);
        }
    }, [auth.isAuthenticated, auth.username, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            return;
        }

        setIsLoading(true);
        try {
            const success = await auth.login(username, password);
            if (success) {
                router.push(`/user/${username}/cardkeys`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (auth.loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div>
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">用户登录</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            用户名
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="请输入用户名"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            密码
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="请输入密码"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !username || !password}
                        className={`w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors 
                            ${(isLoading || !username || !password) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                登录中...
                            </span>
                        ) : '登录'}
                    </button>
                    {auth.error && (
                        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                            {auth.error}
                        </div>
                    )}
                    <div className="text-center mt-4">
                        <Link
                            href="/admin"
                            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            管理员入口
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}