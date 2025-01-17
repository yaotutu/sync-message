'use client';

import { useState } from 'react';
import { User } from '@/types/manage';

export default function ManagePage() {
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        if (!password.trim()) {
            setError('请输入管理员密码');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/manage/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password.trim() }),
            });

            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setError('');
                await loadData();
            } else {
                setError(data.message || '管理员密码错误');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('网络错误，请检查网络连接后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/manage/users', {
                headers: {
                    'x-admin-password': password,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setUsers(data.data || []);
            } else {
                setError(data.message || '加载用户列表失败');
            }
        } catch (error) {
            console.error('Load users error:', error);
            if (error instanceof Error && error.message.includes('401')) {
                setIsLoggedIn(false);
                setError('登录已过期，请重新登录');
            } else {
                setError('网络错误，请检查网络连接后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addUser = async () => {
        const trimmedUsername = newUsername.trim();
        const trimmedPassword = newUserPassword.trim();

        if (!trimmedUsername || !trimmedPassword) {
            setError('用户名和密码不能为空');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/manage/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password,
                },
                body: JSON.stringify({
                    username: trimmedUsername,
                    password: trimmedPassword,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setNewUsername('');
                setNewUserPassword('');
                await loadData();
            } else {
                setError(data.message || '添加用户失败');
            }
        } catch (error) {
            console.error('Add user error:', error);
            if (error instanceof Error && error.message.includes('401')) {
                setIsLoggedIn(false);
                setError('登录已过期，请重新登录');
            } else {
                setError('网络错误，请检查网络连接后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (username: string) => {
        if (!confirm(`确定要删除用户 ${username} 吗？此操作不可恢复。`)) {
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/manage/users?username=${encodeURIComponent(username)}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-password': password,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                await loadData();
            } else {
                setError(data.message || '删除用户失败');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            if (error instanceof Error && error.message.includes('401')) {
                setIsLoggedIn(false);
                setError('登录已过期，请重新登录');
            } else {
                setError('网络错误，请检查网络连接后重试');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyWebhookKey = async (webhookKey: string) => {
        try {
            await navigator.clipboard.writeText(webhookKey);
            const prevError = error;
            setError('Webhook Key 已复制到剪贴板');
            setTimeout(() => {
                setError(prevError);
            }, 2000);
        } catch (err) {
            console.error('Copy failed:', err);
            setError('复制失败，请手动复制');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4">
            {!isLoggedIn ? (
                <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        管理后台
                    </h1>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                管理员密码
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="请输入管理员密码"
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm mt-2">
                                {error}
                            </div>
                        )}
                        <button
                            onClick={login}
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        用户管理
                    </h1>
                    <div className="space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">添加新用户</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="输入用户名"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        密码
                                    </label>
                                    <input
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="输入密码"
                                        disabled={isLoading}
                                    />
                                </div>
                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={addUser}
                                    disabled={isLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? '添加中...' : '添加用户'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">用户列表</h2>
                            {users.map((user) => (
                                <div
                                    key={user.username}
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0"
                                >
                                    <div className="space-y-1">
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {user.username}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 break-all">
                                            Webhook Key: {user.webhookKey || '未设置'}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 w-full sm:w-auto">
                                        {user.webhookKey && (
                                            <button
                                                onClick={() => copyWebhookKey(user.webhookKey!)}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition duration-150 ease-in-out"
                                            >
                                                复制Key
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteUser(user.username)}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition duration-150 ease-in-out"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 