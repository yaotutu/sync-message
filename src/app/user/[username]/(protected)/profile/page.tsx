'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';

interface UserConfig {
    title?: string;
    cardKeyExpireMinutes?: number;
}

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { username } = use(params);
    const router = useRouter();
    const [config, setConfig] = useState<UserConfig>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        loadConfig();
    }, [username]);

    const loadConfig = async () => {
        try {
            const response = await fetch(`/api/user/${username}/config`);
            const data = await response.json();
            if (data.success) {
                setConfig(data.data || {});
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message || '加载配置失败');
            }
        } catch (err) {
            setError('加载配置失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const response = await fetch(`/api/user/${username}/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            const data = await response.json();
            if (data.success) {
                setSuccessMessage('配置已保存');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message || '保存失败');
            }
        } catch (err) {
            setError('保存失败');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
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
                                个人设置 - {username}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push(`/user/${username}`)}
                                className="ml-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                返回用户中心
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        {/* 基本设置表单 */}
                        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                            <h2 className="text-lg font-medium text-gray-900 dark:text-white">基本设置</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    页面标题
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        value={config.title || ''}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            title: e.target.value
                                        })}
                                        placeholder="请输入页面标题"
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    设置消息页面的标题，不设置则使用默认标题。
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    卡密过期时间（分钟）
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.cardKeyExpireMinutes || ''}
                                        onChange={(e) => setConfig({
                                            ...config,
                                            cardKeyExpireMinutes: parseInt(e.target.value) || undefined
                                        })}
                                        placeholder="默认5分钟"
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    设置卡密的有效期限，超过这个时间卡密将自动失效。不设置则使用系统默认值（5分钟）。
                                </p>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {successMessage && (
                                <div className="text-green-500 text-sm">
                                    {successMessage}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {isSaving ? '保存中...' : '保存设置'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
} 