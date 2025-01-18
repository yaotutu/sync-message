'use client';

import { useParams } from 'next/navigation';

export default function ProductsPage() {
    const params = useParams();
    const username = params?.username as string;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">商品管理</h1>
                <button
                    className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md 
                             hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                >
                    添加商品
                </button>
            </div>

            {/* 商品列表将在这里实现 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <p className="text-gray-600 dark:text-gray-300">商品管理功能即将实现...</p>
            </div>
        </div>
    );
} 