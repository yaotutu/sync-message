'use client';

import { useState } from 'react';
import { WebhookUser } from '@/types/manage';
import WebhookUserList from '@/components/manage/WebhookUserList';

export default function ManagePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [users, setUsers] = useState<WebhookUser[]>([]);
    const [password, setPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        if (!password) {
            setError('请输入管理员密码');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/manage/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setError('');
                loadData();
            } else {
                setError(data.message || '登录失败');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('登录失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/manage/users', {
                headers: {
                    'x-admin-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                setUsers(data.users || []);
                setError('');
            } else {
                setError(data.message || '加载数据失败');
            }
        } catch (error) {
            console.error('Load data error:', error);
            setError('加载数据失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const addUser = async () => {
        if (!newUsername || !newUserPassword) {
            setError('请输入用户名和密码');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/manage/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newUserPassword
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewUsername('');
                setNewUserPassword('');
                loadData();
                setError('');
            } else {
                setError(data.message || '添加用户失败');
            }
        } catch (error) {
            console.error('Add user error:', error);
            setError('添加用户失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (username: string) => {
        if (!confirm(`确定要删除用户 ${username} 吗？`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/manage/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                loadData();
                setError('');
            } else {
                setError(data.message || '删除用户失败');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            setError('删除用户失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div className="flex flex-col">
                                        <label className="leading-loose">管理员密码</label>
                                        <input
                                            type="password"
                                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && login()}
                                            placeholder="请输入管理员密码"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={login}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '登录中...' : '登录'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            添加用户
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    用户名
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="请输入用户名"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    密码
                                </label>
                                <input
                                    type="password"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    placeholder="请输入密码"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={addUser}
                                disabled={isLoading}
                            >
                                {isLoading ? '添加中...' : '添加用户'}
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        <div className="sm:flex sm:items-center">
                            <div className="sm:flex-auto">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    用户列表
                                </h3>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                                <button
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={loadData}
                                >
                                    刷新
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <WebhookUserList
                                users={users}
                                onRefresh={loadData}
                                onDeleteUser={deleteUser}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 