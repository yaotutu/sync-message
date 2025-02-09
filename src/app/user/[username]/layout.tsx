'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MobileNav from '@/components/MobileNav';

export default function UserLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const params = useParams();
    const username = params?.username as string;
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!username) {
            router.push('/user');
            return;
        }

        // 验证用户登录状态
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');

        if (!storedUsername || !storedPassword || storedUsername !== username) {
            router.push('/user');
            return;
        }

        // 验证用户权限
        const verifyUser = async () => {
            try {
                const response = await fetch('/api/user/verify', {
                    headers: {
                        'x-username': storedUsername,
                        'x-password': storedPassword
                    }
                });
                const data = await response.json();
                if (!data.success) {
                    router.push('/user');
                    return;
                }
                setIsLoading(false);
            } catch (error) {
                router.push('/user');
            }
        };

        verifyUser();
    }, [username]);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        router.push('/user');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 顶部导航栏 */}
            <nav className="bg-white dark:bg-gray-800 shadow fixed top-0 left-0 right-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href={`/user/${username}`}
                                className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {username} 的空间
                            </Link>
                        </div>
                        {/* 桌面端导航 */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                href={`/user/${username}/profile`}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                个人设置
                            </Link>
                            <Link
                                href={`/user/${username}/products`}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                商品管理
                            </Link>
                            <Link
                                href={`/user/${username}/cardkeys`}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                            >
                                卡密管理
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                退出登录
                            </button>
                        </div>

                        {/* 移动端菜单按钮 */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                                aria-label="打开菜单"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 移动导航菜单 */}
            <MobileNav
                username={username}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onLogout={handleLogout}
            />

            {/* 主内容区 */}
            <main className="pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
} 