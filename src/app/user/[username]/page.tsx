'use client';

import { useEffect, useState, useCallback } from 'react';
import UserLogin from './login';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

interface UserPageProps {
    params: Promise<{ username: string }>;
}

export default function UserPage({ params }: UserPageProps) {
    const { username } = use(params);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const checkLoginStatus = useCallback(async () => {
        try {
            const response = await fetch(`/api/user/${username}/verify`);
            const data = await response.json();
            setIsLoggedIn(data.success);
        } catch (error) {
            console.error('验证登录状态失败:', error);
            setIsLoggedIn(false);
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    useEffect(() => {
        checkLoginStatus();
    }, [checkLoginStatus]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return <UserLogin username={username} onLoginSuccess={() => {
            setIsLoggedIn(true);
            router.refresh();
        }} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                用户中心 - {username}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={async () => {
                                    await fetch(`/api/user/${username}/logout`, { method: 'POST' });
                                    setIsLoggedIn(false);
                                    router.refresh();
                                }}
                                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* 标题区域 - 优化移动端显示 */}
                    <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                    欢迎回来，{username}
                                </h1>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                    在这里管理您的账户设置和资源
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 卡片网格 - 优化响应式布局 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {/* 个人设置卡片 */}
                        <Link
                            href={`/user/${username}/profile`}
                            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all duration-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-5 sm:p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    个人设置
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    管理您的个人信息和偏好设置
                                </p>
                            </div>
                        </Link>

                        {/* 商品管理卡片 */}
                        <Link
                            href={`/user/${username}/products`}
                            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all duration-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-5 sm:p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    商品管理
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    管理您的商品信息和配置
                                </p>
                            </div>
                        </Link>

                        {/* 卡密管理卡片 */}
                        <Link
                            href={`/user/${username}/cardkeys`}
                            className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all duration-200"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative p-5 sm:p-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    卡密管理
                                </h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                    管理您的卡密生成和使用记录
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}