'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function UserLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('请填写用户名和密码');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/user/verify', {
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || '用户名或密码错误');
            }

            // 保存登录信息
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);

            // 跳转到用户主页
            router.push(`/user/${username}`);
        } catch (err: any) {
            setError(err.message || '登录失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen min-w-full bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 h-screen flex flex-col justify-center">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        用户登录
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    用户名
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="username"
                                        name="username"
                                        type="text"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 
                                                 border border-gray-300 dark:border-gray-600 
                                                 rounded-md shadow-sm placeholder-gray-400 
                                                 focus:outline-none focus:ring-green-500 focus:border-green-500 
                                                 dark:bg-gray-700 dark:text-white
                                                 sm:text-sm"
                                        placeholder="请输入用户名"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    密码
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 
                                                 border border-gray-300 dark:border-gray-600 
                                                 rounded-md shadow-sm placeholder-gray-400 
                                                 focus:outline-none focus:ring-green-500 focus:border-green-500 
                                                 dark:bg-gray-700 dark:text-white
                                                 sm:text-sm"
                                        placeholder="请输入密码"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center py-2 px-4 
                                             border border-transparent rounded-md shadow-sm 
                                             text-sm font-medium text-white 
                                             bg-green-600 hover:bg-green-700 
                                             focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                             dark:focus:ring-offset-gray-800
                                             disabled:opacity-50 disabled:cursor-not-allowed
                                             transition-colors"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            登录中...
                                        </div>
                                    ) : (
                                        '登录'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 