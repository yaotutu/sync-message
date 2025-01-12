'use client';

import { useState } from 'react';
import { WebhookUser, MessageTemplate } from '@/types/manage';

export default function ManagePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState<WebhookUser[]>([]);
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newTemplateName, setNewTemplateName] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 登录
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

    // 加载数据
    const loadData = async () => {
        setIsLoading(true);
        try {
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

            if (usersData.success && templatesData.success) {
                setUsers(usersData.users);
                setTemplates(templatesData.templates);
                setError('');
            } else {
                setError(usersData.message || templatesData.message || '加载数据失败');
            }
        } catch (error) {
            console.error('Load data error:', error);
            setError('加载数据失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 添加用户
    const addUser = async () => {
        if (!newUsername) {
            setError('请输入用户名');
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
                body: JSON.stringify({ username: newUsername })
            });

            const data = await response.json();
            if (data.success) {
                setNewUsername('');
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

    // 删除用户
    const deleteUser = async (username: string) => {
        if (!confirm(`确定要删除用户 ${username} 吗？`)) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/manage/users/${username}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': password }
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

    // 添加模板
    const addTemplate = async () => {
        if (!newTemplateName || !newTemplateContent) {
            setError('请输入模板名称和内容');
            return;
        }

        setIsLoading(true);
        try {
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
                loadData();
                setError('');
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

    // 删除模板
    const deleteTemplate = async (id: number) => {
        if (!confirm('确定要删除此模板吗？')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/manage/templates/${id}`, {
                method: 'DELETE',
                headers: { 'x-admin-password': password }
            });

            const data = await response.json();
            if (data.success) {
                loadData();
                setError('');
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

    // 复制 Webhook Key
    const copyWebhookKey = async (webhookKey: string) => {
        try {
            await navigator.clipboard.writeText(webhookKey);
            alert('Webhook Key 已复制到剪贴板');
        } catch (error) {
            console.error('Copy webhook key error:', error);
            // 使用传统方法复制
            const textArea = document.createElement('textarea');
            textArea.value = webhookKey;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Webhook Key 已复制到剪贴板');
            } catch (error) {
                console.error('Fallback copy error:', error);
                alert('复制失败，请手动复制');
            }
            document.body.removeChild(textArea);
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
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
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

                {/* 用户管理 */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            用户管理
                        </h3>
                        <div className="mt-4 flex items-center">
                            <input
                                type="text"
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="输入用户名"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                            />
                            <button
                                className={`ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                onClick={addUser}
                                disabled={isLoading}
                            >
                                添加用户
                            </button>
                        </div>
                        <div className="mt-6">
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {user.username}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div className="flex items-center">
                                                                    <span className="font-mono">
                                                                        {user.webhookKey}
                                                                    </span>
                                                                    <button
                                                                        className="ml-2 text-indigo-600 hover:text-indigo-900"
                                                                        onClick={() =>
                                                                            copyWebhookKey(
                                                                                user.webhookKey
                                                                            )
                                                                        }
                                                                    >
                                                                        复制
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(
                                                                    user.createdAt
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <button
                                                                    className="text-red-600 hover:text-red-900"
                                                                    onClick={() =>
                                                                        deleteUser(user.username)
                                                                    }
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 模板管理 */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            模板管理
                        </h3>
                        <div className="mt-4 space-y-4">
                            <div>
                                <input
                                    type="text"
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="模板名称"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                />
                            </div>
                            <div>
                                <textarea
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    placeholder="模板内容"
                                    rows={4}
                                    value={newTemplateContent}
                                    onChange={(e) => setNewTemplateContent(e.target.value)}
                                />
                            </div>
                            <button
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                onClick={addTemplate}
                                disabled={isLoading}
                            >
                                添加模板
                            </button>
                        </div>
                        <div className="mt-6">
                            <div className="flex flex-col">
                                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
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
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {template.name}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                <div className="max-w-xs overflow-hidden text-ellipsis">
                                                                    {template.content}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {new Date(
                                                                    template.createdAt
                                                                ).toLocaleString()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <button
                                                                    className="text-red-600 hover:text-red-900"
                                                                    onClick={() =>
                                                                        deleteTemplate(template.id)
                                                                    }
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
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 