'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserHomePage() {
    const params = useParams();
    const username = params?.username as string;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                欢迎回来，{username}
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 个人设置卡片 */}
                <Link
                    href={`/user/${username}/profile`}
                    className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md 
                             hover:shadow-lg transition-shadow"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        个人设置
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        管理您的个人信息和偏好设置
                    </p>
                </Link>

                {/* 商品管理卡片 */}
                <Link
                    href={`/user/${username}/products`}
                    className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md 
                             hover:shadow-lg transition-shadow"
                >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        商品管理
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        管理您的商品信息和配置
                    </p>
                </Link>
            </div>
        </div>
    );
}