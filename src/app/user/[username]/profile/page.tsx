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

    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setUserConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
                {/* 标题区域 */}
                <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        个人设置
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        管理您的账户信息和偏好设置
                    </p>
                </div>

                {/* 提示信息 */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-300 p-4 rounded-lg border border-red-100 dark:border-red-900">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300 p-4 rounded-lg border border-green-100 dark:border-green-900">
                        {success}
                    </div>
                )}

                {/* 设置表单 */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 账号设置卡片 */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                账号设置
                            </h2>
                            <div className="space-y-4">
                                {/* 用户名字段 */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        disabled
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                                               bg-gray-100 dark:bg-gray-900
                                               text-gray-900 dark:text-white
                                               shadow-sm focus:border-green-500 focus:ring-green-500
                                               disabled:opacity-75"
                                    />
                                </div>

                                {/* 密码字段 */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        新密码
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="留空表示不修改"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                                               bg-white dark:bg-gray-700 
                                               text-gray-900 dark:text-white
                                               shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 页面设置卡片 */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                消息页面设置
                            </h2>
                            <div className="space-y-4">
                                {/* 页面标题字段 */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        页面标题
                                    </label>
                                    <input
                                        type="text"
                                        name="pageTitle"
                                        value={userConfig.pageTitle || ''}
                                        onChange={handleConfigChange}
                                        placeholder="默认为：消息查询"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                                               bg-white dark:bg-gray-700 
                                               text-gray-900 dark:text-white
                                               shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>

                                {/* 页面描述字段 */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        页面描述
                                    </label>
                                    <textarea
                                        name="pageDescription"
                                        value={userConfig.pageDescription || ''}
                                        onChange={handleConfigChange}
                                        rows={3}
                                        placeholder="显示在标题下方的描述文字"
                                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 
                                               bg-white dark:bg-gray-700 
                                               text-gray-900 dark:text-white
                                               shadow-sm focus:border-green-500 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 提交按钮 */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent 
                                   text-sm font-medium rounded-md shadow-sm
                                   text-white bg-green-600 hover:bg-green-700 
                                   dark:bg-green-500 dark:hover:bg-green-600
                                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   transition-colors duration-200"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    保存中...
                                </>
                            ) : '保存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}