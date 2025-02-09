'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
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
    }, [username, router]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        router.push('/user');
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <main className="pt-14 md:pt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                        <div className="w-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                                <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 顶部导航栏 - 优化移动端高度和响应式布局 */}
            <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-20 transition-all duration-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-14 md:h-16">
                        <div className="flex items-center flex-shrink-0">
                            <Link
                                href={`/user/${username}`}
                                className="text-lg md:text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                            >
                                {username} 的空间
                            </Link>
                        </div>

                        {/* 桌面端导航 - 优化间距和交互 */}
                        <div className="hidden md:flex items-center space-x-1">
                            <Link
                                href={`/user/${username}/profile`}
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                个人设置
                            </Link>
                            <Link
                                href={`/user/${username}/products`}
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                商品管理
                            </Link>
                            <Link
                                href={`/user/${username}/cardkeys`}
                                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                                卡密管理
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                            >
                                退出登录
                            </button>
                        </div>

                        {/* 移动端菜单按钮 - 优化触摸区域 */}
                        <div className="flex md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all focus:outline-none"
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

            {/* 主内容区 - 优化响应式间距 */}
            <main className="pt-14 md:pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="w-full space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}