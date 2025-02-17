'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { href: '/manage/dashboard', label: '仪表盘' },
    { href: '/manage/users', label: '用户管理' },
    { href: '/manage/templates', label: '模板管理' },
    { href: '/manage/settings', label: '系统设置' },
];

export default function ManageLayout({ children }: LayoutProps) {
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/manage/verify');
                const data = await response.json();

                if (!data.success) {
                    // 如果已经在登录页，不需要重定向
                    if (pathname !== '/manage/login') {
                        router.push('/manage/login');
                    }
                } else {
                    // 如果在登录页且已登录，重定向到仪表盘
                    if (pathname === '/manage/login') {
                        router.push('/manage/dashboard');
                        return;
                    }
                }
            } catch (error) {
                console.error('验证管理员状态失败:', error);
                if (pathname !== '/manage/login') {
                    router.push('/manage/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    // 登录页面使用独立布局
    if (pathname === '/manage/login') {
        return children;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* 顶部导航栏 */}
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">
                                    管理后台
                                </span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === item.href
                                            ? 'border-blue-500 text-gray-900 dark:text-white'
                                            : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white hover:border-gray-300'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 主要内容区域 */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
} 