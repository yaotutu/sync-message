'use client';

import { useAuthContext } from '@/components/AuthProvider';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const router = useRouter();
    const auth = useAuthContext();
    const username = params.username as string;

    useEffect(() => {
        if (!auth.loading) {
            if (!auth.isAuthenticated) {
                // 保存当前路径并重定向到登录页
                const currentPath = window.location.pathname;
                auth.setIntendedPath(currentPath);
                router.push('/login');
            } else if (auth.username !== username) {
                // 如果已登录但访问的不是自己的页面，重定向到自己的页面
                router.push(`/user/${auth.username}/cardkeys`);
            }
        }
    }, [auth.loading, auth.isAuthenticated, auth.username, username, router, auth]);

    // 显示加载状态
    if (auth.loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    // 如果未登录或用户名不匹配，返回 null（让 useEffect 中的重定向生效）
    if (!auth.isAuthenticated || auth.username !== username) {
        return null;
    }

    // 渲染子组件
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
        </div>
    );
}