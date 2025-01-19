'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface UserConfig {
    pageTitle?: string;
    pageDescription?: string;
}

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params?.username as string;

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [userConfig, setUserConfig] = useState<UserConfig>({
        pageTitle: '',
        pageDescription: ''
    });

    // 加载用户配置
    useEffect(() => {
        const loadUserConfig = async () => {
            try {
                const response = await fetch(`/api/user/${username}/config`);
                const data = await response.json();
                if (data.success && data.data) {
                    setUserConfig(data.data);
                }
            } catch (err) {
                console.error('加载用户配置失败:', err);
            }
        };

        loadUserConfig();
    }, [username]);

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // 更新密码
            if (password) {
                const passwordResponse = await fetch(`/api/user/${username}/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-username': username,
                        'x-password': localStorage.getItem('password') || ''
                    },
                    body: JSON.stringify({ password })
                });

                const passwordData = await passwordResponse.json();
                if (!passwordData.success) {
                    setError(passwordData.message);
                    return;
                }

                // 更新本地存储的密码
                localStorage.setItem('password', password);
            }

            // 更新用户配置
            const configResponse = await fetch(`/api/user/${username}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                },
                body: JSON.stringify(userConfig)
            });

            const configData = await configResponse.json();
            if (configData.success) {
                setSuccess('设置已更新');
            } else {
                setError(configData.message);
            }
        } catch (err) {
            setError('更新设置失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 处理配置输入变化
    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人设置</h1>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-300 p-4 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300 p-4 rounded-md">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">账号设置</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                用户名
                            </label>
                            <input
                                type="text"
                                value={username}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-gray-100 dark:bg-gray-900
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                新密码
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="留空表示不修改"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">消息页面设置</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                页面标题
                            </label>
                            <input
                                type="text"
                                name="pageTitle"
                                value={userConfig.pageTitle || ''}
                                onChange={handleConfigChange}
                                placeholder="默认为：消息查询"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                页面描述
                            </label>
                            <textarea
                                name="pageDescription"
                                value={userConfig.pageDescription || ''}
                                onChange={handleConfigChange}
                                rows={3}
                                placeholder="显示在标题下方的描述文字"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md
                                 hover:bg-green-600 dark:hover:bg-green-700
                                 focus:outline-none focus:ring-2 focus:ring-green-500
                                 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '保存中...' : '保存'}
                    </button>
                </div>
            </form>
        </div>
    );
} 