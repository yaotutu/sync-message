'use client';

import { useState } from 'react';
import { WebhookUser } from '@/types/manage';

export default function ManagePage() {
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<WebhookUser[]>([]);
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
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {!isLoggedIn ? (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">管理员登录</h2>
                        <div className="space-y-4">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && login()}
                                placeholder="请输入管理员密码"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                                disabled={isLoading}
                            />
                            <button
                                onClick={login}
                                disabled={isLoading}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 transition-all"
                            >
                                {isLoading ? '登录中...' : '登录'}
                            </button>
                            {error && (
                                <div className="text-red-500 text-sm mt-2">{error}</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-2xl font-bold mb-4">用户管理</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="用户名"
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                                        disabled={isLoading}
                                    />
                                    <input
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                        placeholder="密码"
                                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-gray-100"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={addUser}
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 transition-all whitespace-nowrap"
                                    >
                                        {isLoading ? '添加中...' : '添加用户'}
                                    </button>
                                </div>
                                {error && (
                                    <div className="text-red-500 text-sm">{error}</div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="p-6 pb-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold">用户列表</h3>
                                <button
                                    onClick={loadData}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 transition-all"
                                >
                                    {isLoading ? '刷新中...' : '刷新'}
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                用户名
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Webhook Key
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                创建时间
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                操作
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.username}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {user.username}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                            {user.webhookKey}
                                                        </code>
                                                        <button
                                                            onClick={() => copyWebhookKey(user.webhookKey)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                        >
                                                            复制
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(user.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <button
                                                        onClick={() => deleteUser(user.username)}
                                                        disabled={isLoading}
                                                        className="text-red-500 hover:text-red-700 disabled:text-red-300"
                                                    >
                                                        删除
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 