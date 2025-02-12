'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

interface ProtectedLayoutProps {
    children: React.ReactNode;
    params: Promise<{ username: string }>;
}

export default function ProtectedLayout({ children, params }: ProtectedLayoutProps) {
    const { username } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch(`/api/user/${username}/verify`);
                const data = await response.json();

                if (!data.success) {
                    router.push('/user');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('验证登录状态失败:', error);
                router.push('/user');
            }
        };

        checkAuth();
    }, [username, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">验证登录状态...</p>
                </div>
            </div>
        );
    }

    return children;
} 