'use client';

import config from '@/config';
import { CardKey } from '@/types/user';
import React, { useCallback, useEffect, useState } from 'react';

type CardKeyStatus = 'all' | 'unused' | 'used';

export default function CardKeyManagePage() {
    const [cardKeys, setCardKeys] = useState<CardKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generatingCount, setGeneratingCount] = useState(1);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const [newlyGeneratedKeys, setNewlyGeneratedKeys] = useState<string[]>([]);

    // 新增状态
    const [currentStatus, setCurrentStatus] = useState<CardKeyStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    const fetchCardKeys = useCallback(async (user: string, pass: string) => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/cardkeys', {
                headers: {
                    'x-username': user,
                    'x-password': pass
                }
            });

            const data = await response.json();
            if (data.success) {
                setCardKeys(data.data);
                setError(null);
            } else {
                if (data.message === '无效的用户名或密码') {
                    logout();
                }
                setError(data.message);
            }
        } catch {
            setError('获取卡密列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsMounted(true);
        // 检查本地存储的登录信息
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setIsLoggedIn(true);
            fetchCardKeys(savedUsername, savedPassword);
        } else {
            setLoading(false);
            setIsLoggedIn(false);
        }
    }, [fetchCardKeys]);

    const login = async () => {
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                setIsLoggedIn(true);
                setError(null);
                fetchCardKeys(username, password);
            } else {
                setError(data.message || '登录失败');
            }
        } catch (_error) {
            setError('登录失败，请稍后重试');
        }
    };

    // 获取未使用的卡密数量
    const getUnusedKeysCount = () => {
        return cardKeys.filter(k => !k.usedAt).length;
    };

    // 检查是否可以生成新卡密
    const canGenerateKeys = () => {
        const unusedCount = getUnusedKeysCount();
        const remainingSlots = config.cardKey.maxUnusedKeys - unusedCount;
        return remainingSlots >= generatingCount;
    };

    const generateCardKeys = async () => {
        if (!canGenerateKeys()) {
            setError(`未使用的卡密数量已达到上限（${config.cardKey.maxUnusedKeys}个），请等待当前卡密使用后再生成新的卡密`);
            return;
        }

        try {
            setError(null);
            const response = await fetch(`/api/cardkey/generate?count=${generatingCount}`, {
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                // 保存新生成的卡密
                const newKeys = data.data.map((key: CardKey) => key.key);
                setNewlyGeneratedKeys(newKeys);
                fetchCardKeys(username, password);
            } else {
                setError('生成卡密失败：' + data.message);
            }
        } catch {
            setError('生成卡密失败，请稍后重试');
        }
    };

    const copyToClipboard = (text: string) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);

        try {
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            document.execCommand('copy');
            setError('复制成功！');
            setTimeout(() => setError(null), 2000);
        } catch {
            setError('复制失败，请手动复制');
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const logout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        setIsLoggedIn(false);
        setUsername('');
        setPassword('');
        setCardKeys([]);
        setError(null);
    };

    const formatTime = (ms: number) => {
        if (!isMounted) return ''; // 防止服务端渲染时的格式化
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}分${seconds}秒`;
    };

    const getStatusText = (cardKey: CardKey) => {
        if (!cardKey.usedAt) {
            return { text: '未使用', color: 'text-gray-500', bgColor: 'bg-gray-100' };
        }
        if (cardKey.expiresIn && cardKey.expiresIn > 0) {
            return {
                text: `使用中 (剩余${formatTime(cardKey.expiresIn)})`,
                color: 'text-green-600',
                bgColor: 'bg-green-50'
            };
        }
        return {
            text: '已过期',
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        };
    };

    // 获取过滤后的卡密列表
    const getFilteredCardKeys = () => {
        let filtered = [...cardKeys];
        switch (currentStatus) {
            case 'unused':
                filtered = filtered.filter(key => !key.usedAt);
                break;
            case 'used':
                filtered = filtered.filter(key => key.usedAt);
                break;
            default:
                break;
        }
        return filtered;
    };

    // 获取当前页的卡密
    const getCurrentPageKeys = () => {
        const filtered = getFilteredCardKeys();
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    };

    // 获取总页数
    const getTotalPages = () => {
        return Math.ceil(getFilteredCardKeys().length / pageSize);
    };

    // 复制所有未使用的卡密
    const copyAllUnusedKeys = () => {
        const unusedKeys = cardKeys
            .filter(k => !k.usedAt)
            .map(k => k.key)
            .join('\n');

        if (!unusedKeys) {
            setError('没有未使用的卡密可复制');
            return;
        }

        copyToClipboard(unusedKeys);
    };

    // 状态标签组件
    const StatusTabs = () => (
        <div className="flex space-x-2 mb-4">
            {[
                { id: 'all', text: '全部' },
                { id: 'unused', text: '未使用' },
                { id: 'used', text: '已使用' }
            ].map(status => (
                <button
                    key={status.id}
                    onClick={() => {
                        setCurrentStatus(status.id as CardKeyStatus);
                        setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStatus === status.id
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    {status.text}
                    <span className="ml-2 text-xs">
                        ({status.id === 'all'
                            ? cardKeys.length
                            : status.id === 'unused'
                                ? cardKeys.filter(k => !k.usedAt).length
                                : cardKeys.filter(k => k.usedAt).length})
                    </span>
                </button>
            ))}
        </div>
    );

    // 分页组件
    const Pagination = () => {
        const totalPages = getTotalPages();
        if (totalPages <= 1) return null;

        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                    上一页
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    第 {currentPage} 页 / 共 {totalPages} 页
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                    下一页
                </button>
            </div>
        );
    };

    if (!isMounted) {
        return null; // 或者返回一个加载占位符
    }

    if (loading) {
        return <div className="p-4">加载中...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-8 sm:py-10 bg-white dark:bg-gray-800 mx-4 sm:mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                        <div className="max-w-md mx-auto">
                            <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">卡密管理登录</h1>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        用户名
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                                        placeholder="请输入用户名"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        密码
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && login()}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                                        placeholder="请输入密码"
                                    />
                                </div>
                                {error && (
                                    <div className="text-red-500 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    onClick={login}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 text-sm sm:text-base"
                                >
                                    登录
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">卡密管理</h1>
                            <button
                                onClick={logout}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
                            >
                                退出登录
                            </button>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            当前共有 {cardKeys.length} 个卡密
                            {cardKeys.length > 0 && `，其中 ${getUnusedKeysCount()} 个未使用（最大 ${config.cardKey.maxUnusedKeys} 个）`}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">生成数量:</label>
                            <select
                                value={generatingCount}
                                onChange={(e) => setGeneratingCount(Number(e.target.value))}
                                className="border rounded px-2 py-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm flex-1 sm:flex-none"
                            >
                                {[1, 5, 10, 20].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={generateCardKeys}
                            disabled={!canGenerateKeys()}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            生成卡密
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded relative text-sm sm:text-base">
                        {error}
                    </div>
                )}

                {newlyGeneratedKeys.length > 0 && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2 sm:gap-0">
                            <h3 className="text-base sm:text-lg font-medium text-green-800 dark:text-green-200">新生成的卡密</h3>
                            <button
                                onClick={() => copyToClipboard(newlyGeneratedKeys.join('\n'))}
                                className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors w-full sm:w-auto"
                            >
                                复制全部
                            </button>
                        </div>
                        <div className="space-y-2">
                            {newlyGeneratedKeys.map((key) => (
                                <div key={key} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-gray-800 p-2 rounded gap-2 sm:gap-0">
                                    <code className="font-mono text-sm sm:text-base text-green-700 dark:text-green-300 break-all w-full sm:w-auto">{key}</code>
                                    <button
                                        onClick={() => copyToClipboard(key)}
                                        className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 w-full sm:w-auto text-center sm:text-left"
                                    >
                                        复制
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 状态切换标签 */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <StatusTabs />
                    {currentStatus === 'unused' && getUnusedKeysCount() > 0 && (
                        <button
                            onClick={copyAllUnusedKeys}
                            className="mt-2 sm:mt-0 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition-colors text-sm"
                        >
                            复制所有未使用卡密
                        </button>
                    )}
                </div>

                {/* 卡密列表 */}
                <div className="grid gap-4">
                    {getCurrentPageKeys().map((cardKey) => {
                        const status = getStatusText(cardKey);
                        return (
                            <div
                                key={cardKey.id}
                                className={`border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center dark:border-gray-700 ${status.bgColor} dark:bg-opacity-10 hover:shadow-md transition-shadow gap-2 sm:gap-0`}
                            >
                                <div className="space-y-1 w-full sm:w-auto">
                                    <div className="font-mono text-base sm:text-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 dark:text-white break-all">
                                        {cardKey.key}
                                        <span className={`text-sm px-2 py-0.5 rounded-full ${status.color} dark:text-opacity-90 ${status.bgColor} dark:bg-opacity-20 border border-current whitespace-nowrap`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        创建时间: {new Date(cardKey.createdAt).toLocaleString()}
                                    </div>
                                    {cardKey.usedAt && (
                                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                            使用时间: {isMounted ? new Date(cardKey.usedAt).toLocaleString() : ''}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {getFilteredCardKeys().length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed rounded-lg dark:border-gray-700 text-sm sm:text-base">
                            {currentStatus === 'all'
                                ? '暂无卡密，点击"生成卡密"按钮创建新的卡密'
                                : currentStatus === 'unused'
                                    ? '暂无未使用的卡密'
                                    : '暂无已使用的卡密'}
                        </div>
                    )}
                </div>

                {/* 添加分页 */}
                <Pagination />
            </div>
        </div>
    );
} 