'use client';

import { useState, useEffect } from 'react';
import { WebhookUser, MessageTemplate } from '@/types/manage';

export default function ManagePage() {
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState<WebhookUser[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await fetch('/api/manage/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setError('');
                await loadData();
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
        try {
            setIsLoading(true);
            setError('');
            const [usersResponse, templatesResponse] = await Promise.all([
                fetch('/api/manage/users', {
                    headers: { 'x-admin-password': password }
                }),
                fetch('/api/manage/templates', {
                    headers: { 'x-admin-password': password }
                })
            ]);

            const [usersData, templatesData] = await Promise.all([
                usersResponse.json(),
                templatesResponse.json()
            ]);

            if (usersData.success) {
                setUsers(usersData.users || []);
            } else {
                setError(usersData.message || '获取用户列表失败');
            }

            if (templatesData.success) {
                setTemplates(templatesData.templates || []);
            } else {
                setError(templatesData.message || '获取模板列表失败');
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            setError('加载数据失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const addUser = async () => {
        if (!newUsername) {
            setError('请输入用户名');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const response = await fetch('/api/manage/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password
                },
                body: JSON.stringify({ username: newUsername })
            });

            const data = await response.json();
            if (data.success) {
                setNewUsername('');
                await loadData();
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

        try {
            setIsLoading(true);
            setError('');
            const response = await fetch(`/api/manage/users/${username}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                await loadData();
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

    const addTemplate = async () => {
        if (!newTemplateName || !newTemplateContent) {
            setError('请输入模板名称和内容');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const response = await fetch('/api/manage/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password
                },
                body: JSON.stringify({
                    name: newTemplateName,
                    content: newTemplateContent
                })
            });

            const data = await response.json();
            if (data.success) {
                setNewTemplateName('');
                setNewTemplateContent('');
                await loadData();
            } else {
                setError(data.message || '添加模板失败');
            }
        } catch (error) {
            console.error('Add template error:', error);
            setError('添加模板失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm('确定要删除这个模板吗？')) {
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            const response = await fetch(`/api/manage/templates/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                await loadData();
            } else {
                setError(data.message || '删除模板失败');
            }
        } catch (error) {
            console.error('Delete template error:', error);
            setError('删除模板失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const copyWebhookKey = async (webhookKey: string) => {
        try {
            await navigator.clipboard.writeText(webhookKey);
            alert('Webhook Key 已复制到剪贴板');
        } catch (error) {
            console.error('Copy webhook key error:', error);
            setError('复制失败，请手动复制');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            login();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    {!isLoggedIn ? (
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            管理员密码
                                        </label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder="请输入管理员密码"
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-500 text-sm mb-4">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        onClick={login}
                                        disabled={isLoading}
                                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isLoading ? '登录中...' : '登录'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">Webhook 用户管理</h2>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                                        placeholder="用户名"
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={addUser}
                                        disabled={isLoading}
                                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isLoading ? '添加中...' : '添加用户'}
                                    </button>
                                </div>
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    操作
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.username}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <button
                                                            onClick={() => copyWebhookKey(user.webhookKey)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            disabled={isLoading}
                                                        >
                                                            点击复制
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => deleteUser(user.username)}
                                                            className="text-red-600 hover:text-red-900"
                                                            disabled={isLoading}
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

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold mb-4">消息模板管理</h2>
                                <div className="mb-4 space-y-2">
                                    <input
                                        type="text"
                                        value={newTemplateName}
                                        onChange={(e) => setNewTemplateName(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="模板名称"
                                        disabled={isLoading}
                                    />
                                    <textarea
                                        value={newTemplateContent}
                                        onChange={(e) => setNewTemplateContent(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        placeholder="模板内容"
                                        rows={4}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={addTemplate}
                                        disabled={isLoading}
                                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        {isLoading ? '添加中...' : '添加模板'}
                                    </button>
                                </div>
                                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    名称
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    内容
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    创建时间
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    操作
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {templates.map((template) => (
                                                <tr key={template.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {template.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {template.content}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(template.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => deleteTemplate(template.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            disabled={isLoading}
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

                            {error && (
                                <div className="text-red-500 text-sm mb-4">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 