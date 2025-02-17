'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

interface User {
    username: string;
}

interface PageProps {
    params: Promise<{ username: string }>;
}

export default function UserPage({ params }: PageProps) {
    const { username } = React.use(params);
    const router = useRouter();
    const { user, logout } = useAuth();

    // 如果未登录，跳转到登录页
    if (!user) {
        router.replace('/login');
        return null;
    }

    // 如果访问的不是自己的页面，跳转到自己的页面
    if ((user as User).username !== username) {
        router.replace(`/user/${(user as User).username}`);
        return null;
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
                                onClick={logout}
                                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href={`/user/${username}/profile`}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">个人设置</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的个人信息和偏好设置</p>
                    </Link>

                    <Link
                        href={`/user/${username}/message`}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">消息记录</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">查看所有历史消息记录</p>
                    </Link>

                    <Link
                        href={`/user/${username}/products`}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">商品管理</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">管理您的商品信息和配置</p>
                    </Link>

                    <Link
                        href={`/user/${username}/simple-cardkeys`}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">普通卡密</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">管理普通卡密的生成和使用记录</p>
                    </Link>

                    <Link
                        href={`/user/${username}/linked-cardkeys`}
                        className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">带链接卡密</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">管理带分享链接的卡密生成和使用</p>
                    </Link>
                </div>
            </main>
        </div>
    );
}