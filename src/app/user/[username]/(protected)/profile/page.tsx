'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface UserConfig {
    theme?: string;
    language?: string;
    cardKeyExpireMinutes?: number;
    title?: string;
}

interface ProfilePageProps {
    params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
    const { username } = use(params);
    const [mounted, setMounted] = useState(false);
    const [config, setConfig] = useState<UserConfig>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    // 密码相关状态
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        setMounted(true);
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

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsChangingPassword(true);
        setPasswordError('');
        setPasswordSuccess('');

        // 验证新密码
        if (newPassword !== confirmPassword) {
            setPasswordError('两次输入的新密码不一致');
            setIsChangingPassword(false);
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('新密码长度不能小于6位');
            setIsChangingPassword(false);
            return;
        }

        try {
            const response = await fetch(`/api/user/${username}/password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPasswordSuccess('密码修改成功');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setPasswordSuccess(''), 3000);
            } else {
                setPasswordError(data.message || '密码修改失败');
            }
        } catch (err) {
            setPasswordError('密码修改失败，请重试');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // 防止 hydration 不匹配
    if (!mounted) {
        return null;
    }

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

                        {/* 修改密码表单 */}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">修改密码</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        当前密码
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            required
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        新密码
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        确认新密码
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {passwordError && (
                                    <div className="text-red-500 text-sm">
                                        {passwordError}
                                    </div>
                                )}

                                {passwordSuccess && (
                                    <div className="text-green-500 text-sm">
                                        {passwordSuccess}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isChangingPassword}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isChangingPassword ? '修改中...' : '修改密码'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 