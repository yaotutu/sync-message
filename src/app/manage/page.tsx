'use client';

import { User } from '@/types/manage';
import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ManagePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { data: session, status } = useSession();
    const router = useRouter();

    // 如果未登录，重定向到登录页面
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('/api/manage/users');
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
            setError('网络错误，请检查网络连接后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 当session加载完成且已登录时，加载用户数据
    useEffect(() => {
        if (status === 'authenticated') {
            loadData();
        }
    }, [status]);

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
            setError('网络错误，请检查网络连接后重试');
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
            setError('网络错误，请检查网络连接后重试');
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

    // 如果正在加载session或未登录，显示加载状态
    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                管理后台
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => signOut({ callbackUrl: '/auth/login' })}
                                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
            </main>
        </div>
    );
} 