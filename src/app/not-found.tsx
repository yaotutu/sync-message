import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        404 - 页面不存在
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        抱歉，您访问的页面不存在
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        返回首页
                    </Link>
                </div>
            </div>
        </div>
    );
} 