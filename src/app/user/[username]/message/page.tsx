'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Product {
    id: string;
    title: string;
    imageUrl?: string;
    link?: string;
    price?: number;
    description?: string;
    notes?: string;
}

interface UserConfig {
    pageTitle?: string;
    pageDescription?: string;
}

export default function MessagePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const username = params.username as string;
    const urlKey = searchParams.get('key');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [userConfig, setUserConfig] = useState<UserConfig>({
        pageTitle: '',
        pageDescription: ''
    });
    const [cardKey, setCardKey] = useState(urlKey || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async (key: string) => {
        if (!key) {
            setError('未提供卡密');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 获取消息和产品信息
            const response = await fetch(`/api/user/${username}/message?key=${encodeURIComponent(key)}`);
            const data = await response.json();

            if (data.success && data.data) {
                setProducts(data.data.products || []);
                if (data.data.config) {
                    setUserConfig(data.data.config);
                }
                setError('');
            } else {
                setError(data.message || '加载失败');
                setProducts([]);
            }
        } catch (error) {
            setError('加载失败');
            setProducts([]);
        } finally {
            setLoading(false);
            setIsSubmitting(false);
        }
    };

    // 初始加载
    useEffect(() => {
        if (urlKey) {
            loadData(urlKey);
        } else {
            setLoading(false);
        }
    }, [username, urlKey]);

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardKey.trim()) {
            setError('请输入卡密');
            return;
        }

        setIsSubmitting(true);
        // 更新 URL，但不重新加载页面
        router.push(`/user/${username}/message?key=${encodeURIComponent(cardKey)}`, { scroll: false });
        await loadData(cardKey);
    };

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {(userConfig?.pageTitle || '产品信息')}
                    </h1>
                    {userConfig?.pageDescription && (
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            {userConfig.pageDescription}
                        </p>
                    )}
                </div>

                {/* 卡密输入表单 */}
                <div className="mb-8">
                    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={cardKey}
                                onChange={(e) => setCardKey(e.target.value)}
                                placeholder="请输入卡密"
                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '查询中...' : '查询'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-4 rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col"
                            >
                                {product.imageUrl && (
                                    <div className="relative h-48">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex-grow">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {product.title}
                                    </h3>
                                    {product.description && (
                                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                                            {product.description}
                                        </p>
                                    )}
                                    {product.notes && (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {product.notes}
                                        </p>
                                    )}
                                    {product.price !== undefined && (
                                        <p className="mt-2 text-lg font-semibold text-red-600 dark:text-red-400">
                                            ¥{product.price.toFixed(2)}
                                        </p>
                                    )}
                                    {product.link && (
                                        <a
                                            href={product.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            查看详情
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !error && (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        暂无产品信息
                    </div>
                )}
            </div>
        </div>
    );
}