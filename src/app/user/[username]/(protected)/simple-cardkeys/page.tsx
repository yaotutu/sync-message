'use client';

import React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SimpleCardKey } from '@/types/cardKey';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { simpleCardKeyService } from '@/lib/api/services';

interface SimpleCardKeysPageProps {
    params: Promise<{ username: string }>;
}

interface CardKeyFormData {
    count: number;
}

type FilterStatus = 'all' | 'used' | 'unused';

export default function SimpleCardKeysPage({ params }: SimpleCardKeysPageProps) {
    const { username } = use(params);
    const router = useRouter();
    const [cardKeys, setCardKeys] = useState<SimpleCardKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState<CardKeyFormData>({
        count: 1
    });

    // 状态管理
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCardKeys = async () => {
        try {
            const response = await simpleCardKeyService.getCardKeys(username);
            if (response.success) {
                setCardKeys(response.data || []);
                setError(null);
            } else {
                setError(response.message || '获取卡密列表失败');
                if (response.message?.includes('未登录') || response.message?.includes('认证')) {
                    router.push('/user');
                }
            }
        } catch (error) {
            setError('获取卡密列表失败');
        } finally {
            setLoading(false);
        }
    };

    const generateCardKeys = async () => {
        if (generating) return;

        try {
            setGenerating(true);
            setError(null);

            const response = await simpleCardKeyService.generateCardKeys(username, formData.count);

            if (response.success) {
                await fetchCardKeys();
                setError(`成功生成 ${formData.count} 个卡密`);
                setTimeout(() => setError(null), 3000);
            } else {
                setError(response.message || '生成卡密失败');
                if (response.message?.includes('未登录') || response.message?.includes('认证')) {
                    router.push('/user');
                }
            }
        } catch (error) {
            setError('生成卡密失败，请稍后重试');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (text: string) => {
        if (copyToClipboard(text)) {
            setError('复制成功');
            setTimeout(() => setError(null), 2000);
        } else {
            setError('复制失败，请手动复制');
        }
    };

    const copyAllUnusedKeys = () => {
        const unusedKeys = cardKeys
            .filter(key => !key.usedAt)
            .map(key => key.key)
            .join('\n');

        if (!unusedKeys) {
            setError('没有未使用的卡密可复制');
            return;
        }

        if (copyToClipboard(unusedKeys)) {
            setError('已复制所有未使用的卡密');
            setTimeout(() => setError(null), 2000);
        } else {
            setError('复制失败，请手动复制');
        }
    };

    useEffect(() => {
        fetchCardKeys();
    }, [username]);

    useEffect(() => {
        // 切换筛选状态时重置页码
        setCurrentPage(1);
    }, [filterStatus, searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    // 筛选和搜索逻辑
    const filteredCardKeys = cardKeys.filter(key => {
        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'used' ? key.usedAt !== null :
                    !key.usedAt;

        const matchesSearch = searchQuery
            ? key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (key.usedAt && new Date(key.usedAt).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()))
            : true;

        return matchesStatus && matchesSearch;
    });

    // 分页逻辑
    const totalPages = Math.ceil(filteredCardKeys.length / itemsPerPage);
    const paginatedCardKeys = filteredCardKeys.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const unusedCount = cardKeys.filter(key => !key.usedAt).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                普通卡密管理 - {username}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push(`/user/${username}/linked-cardkeys`)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                带链接卡密
                            </button>
                            <button
                                onClick={() => router.push(`/user/${username}`)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                返回用户中心
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        {/* 生成卡密控制面板 */}
                        <div className="mb-8 border-b pb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">生成卡密</h3>
                            <div className="flex items-end gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        生成数量
                                    </label>
                                    <select
                                        value={formData.count}
                                        onChange={(e) => setFormData(prev => ({ ...prev, count: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    >
                                        {[1, 5, 10, 20, 50, 100].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={generateCardKeys}
                                    disabled={generating}
                                    className={`px-4 py-2 rounded-md text-white transition-colors ${generating
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {generating ? '生成中...' : '生成卡密'}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className={`mb-6 p-4 rounded-md ${error.includes('成功')
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                                }`}>
                                {error}
                            </div>
                        )}

                        {/* 搜索和筛选区域 */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="搜索卡密或使用时间..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-blue-500 border border-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    全部
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unused')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'unused'
                                        ? 'bg-green-500 text-white'
                                        : 'text-green-500 border border-green-500 hover:bg-green-50'
                                        }`}
                                >
                                    未使用
                                </button>
                                <button
                                    onClick={() => setFilterStatus('used')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'used'
                                        ? 'bg-gray-500 text-white'
                                        : 'text-gray-500 border border-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    已使用
                                </button>
                            </div>
                        </div>

                        {/* 卡密列表 */}
                        <div className="space-y-4">
                            {paginatedCardKeys.map((cardKey) => (
                                <div
                                    key={cardKey.id}
                                    className="p-4 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="font-mono text-sm mb-2 break-all text-gray-900 dark:text-gray-100">
                                                {cardKey.key}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                创建时间: {new Date(cardKey.createdAt).toLocaleString()}
                                            </div>
                                            {cardKey.usedAt && (
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    使用时间: {new Date(cardKey.usedAt).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        {!cardKey.usedAt && (
                                            <button
                                                onClick={() => handleCopy(cardKey.key)}
                                                className="ml-4 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                            >
                                                复制卡密
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {filteredCardKeys.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed dark:border-gray-700 rounded-lg">
                                    {searchQuery ? '没有找到匹配的卡密' : '暂无卡密数据'}
                                </div>
                            )}
                        </div>

                        {/* 分页控制 */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    上一页
                                </button>
                                <span className="px-3 py-1">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 