'use client';

import { useAuthContext } from '@/components/AuthProvider';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CardKey } from '@/types/cardKey';

export default function CardKeysPage() {
    const params = useParams();
    const auth = useAuthContext();
    const username = params.username as string;

    const [cardKeys, setCardKeys] = useState<CardKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generationCount, setGenerationCount] = useState(1);

    const fetchCardKeys = async () => {
        if (!auth.isAuthenticated) return;

        try {
            const storedPassword = localStorage.getItem('password');
            const response = await fetch(`/api/user/${username}/cardkeys`, {
                headers: {
                    'x-username': auth.username!,
                    'x-password': storedPassword || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                setCardKeys(data.data);
                setError(null);
            } else {
                setError(data.message);
                if (data.message.includes('认证')) {
                    await auth.validateAuth();
                }
            }
        } catch (error) {
            setError('获取卡密列表失败');
        } finally {
            setLoading(false);
        }
    };

    const generateCardKeys = async () => {
        if (!auth.isAuthenticated || generating) return;

        try {
            setGenerating(true);
            setError(null);
            const storedPassword = localStorage.getItem('password');

            const response = await fetch(`/api/user/${username}/cardkeys?count=${generationCount}`, {
                method: 'POST',
                headers: {
                    'x-username': auth.username!,
                    'x-password': storedPassword || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchCardKeys();
                setError(`成功生成 ${generationCount} 个卡密`);
                setTimeout(() => setError(null), 3000);
            } else {
                setError(data.message);
                if (data.message.includes('认证')) {
                    await auth.validateAuth();
                }
            }
        } catch (error) {
            setError('生成卡密失败，请稍后重试');
        } finally {
            setGenerating(false);
        }
    };

    const copyCardKey = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setError('复制成功');
            setTimeout(() => setError(null), 2000);
        } catch (err) {
            setError('复制失败，请手动复制');
        }
    };

    const copyAllUnusedKeys = async () => {
        try {
            const unusedKeys = cardKeys
                .filter(key => !key.usedAt)
                .map(key => key.key)
                .join('\n');

            if (!unusedKeys) {
                setError('没有未使用的卡密可复制');
                return;
            }

            await navigator.clipboard.writeText(unusedKeys);
            setError('已复制所有未使用的卡密');
            setTimeout(() => setError(null), 2000);
        } catch (err) {
            setError('复制失败，请手动复制');
        }
    };

    useEffect(() => {
        fetchCardKeys();
    }, [auth.isAuthenticated, auth.username, username]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    const unusedCount = cardKeys.filter(key => !key.usedAt).length;

    return (
        <div className="p-4 dark:bg-gray-900 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">卡密列表</h1>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            共 {cardKeys.length} 个卡密，{unusedCount} 个未使用
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 dark:text-gray-300">生成数量:</label>
                            <select
                                value={generationCount}
                                onChange={(e) => setGenerationCount(Number(e.target.value))}
                                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                disabled={generating}
                            >
                                {[1, 5, 10, 20, 50, 100].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={generateCardKeys}
                                disabled={generating || !auth.isAuthenticated}
                                className={`px-4 py-2 rounded-md text-white transition-colors flex-1 sm:flex-none ${generating || !auth.isAuthenticated
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                                    }`}
                            >
                                {generating ? '生成中...' : '生成卡密'}
                            </button>
                            {unusedCount > 0 && (
                                <button
                                    onClick={copyAllUnusedKeys}
                                    className="px-4 py-2 rounded-md text-blue-500 dark:text-blue-400 border border-blue-500 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    复制未用
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className={`p-4 rounded-md mb-4 ${error.includes('成功')
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                    }`}>
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {cardKeys.map((cardKey) => (
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
                                    onClick={() => copyCardKey(cardKey.key)}
                                    className="ml-4 px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                    复制
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {cardKeys.length === 0 && !error && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                        暂无卡密数据，点击"生成卡密"按钮创建新的卡密
                    </div>
                )}
            </div>
        </div>
    );
}
