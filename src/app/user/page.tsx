'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function UserLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
                setError(null);
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                router.push(`/user/${username}`);
            } else {
                setError(data.message || '登录失败');
            }
        } catch {
            setError('登录失败，请稍后重试');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-md mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                        用户登录
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                用户名
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500
                                         dark:focus:border-green-400 dark:focus:ring-green-400"
                                placeholder="请输入用户名"
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
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500
                                         dark:focus:border-green-400 dark:focus:ring-green-400"
                                placeholder="请输入密码"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-500 dark:bg-green-600 text-white 
                                     py-2 px-4 rounded-md 
                                     hover:bg-green-600 dark:hover:bg-green-700 
                                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                                     dark:focus:ring-offset-gray-800
                                     transition-colors"
                        >
                            登录
                        </button>
                        {error && (
                            <div className="text-red-500 dark:text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
} 