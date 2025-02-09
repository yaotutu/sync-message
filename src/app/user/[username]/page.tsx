'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserHomePage() {
    const params = useParams();
    const username = params?.username as string;

    return (
        <div className="space-y-6">
            {/* 标题区域 - 优化移动端显示 */}
            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    欢迎回来，{username}
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    在这里管理您的账户设置和资源
                </p>
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
                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all duration-200 sm:col-span-2 lg:col-span-1"
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
    );
}