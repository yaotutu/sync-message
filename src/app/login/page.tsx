'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [keyCount, setKeyCount] = useState(1);
    const [keys, setKeys] = useState<string[]>([]);

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
                setIsLoggedIn(true);
            } else {
                setError(data.message || '登录失败');
            }
        } catch {
            setError('登录失败，请稍后重试');
        }
    };

    const generateKeys = async () => {
        try {
            const response = await fetch(`/api/cardkey/generate?count=${keyCount}`, {
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                setKeys(data.data);
            } else {
                setError(data.message || '生成密钥失败');
            }
        } catch {
            setError('生成密钥失败，请稍后重试');
        }
    };

    const logout = () => {
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setKeys([]);
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
            {!isLoggedIn ? (
                <div>
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">用户登录</h1>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                用户名
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="请输入用户名"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                密码
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                                placeholder="请输入密码"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        >
                            登录
                        </button>
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <div className="text-center mt-4">
                            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">
                                管理员入口
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">密钥管理</h1>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="keyCount" className="block text-sm font-medium text-gray-700">
                                生成数量
                            </label>
                            <input
                                type="number"
                                id="keyCount"
                                value={keyCount}
                                onChange={(e) => setKeyCount(Number(e.target.value))}
                                min="1"
                                max="10"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                        <button
                            onClick={generateKeys}
                            className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        >
                            生成密钥
                        </button>
                        {keys.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-md whitespace-pre-wrap break-all">
                                {keys.join('\n')}
                            </div>
                        )}
                        <button
                            onClick={logout}
                            className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            退出登录
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 