'use client';

import { useState, useEffect } from 'react';
import { CardKey } from '@/types/user';

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
    }, []);

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
        } catch (error) {
            setError('登录失败，请稍后重试');
        }
    };

    const fetchCardKeys = async (user: string, pass: string) => {
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
        } catch (error) {
            setError('获取卡密列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    const generateCardKeys = async () => {
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
        } catch (error) {
            setError('生成卡密失败，请稍后重试');
        }
    };

    const copyToClipboard = (text: string) => {
        // 创建一个临时的 textarea 元素
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);

        try {
            // 选择文本
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            // 执行复制命令
            document.execCommand('copy');
            setError('复制成功！');
            setTimeout(() => setError(null), 2000);
        } catch (err) {
            setError('复制失败，请手动复制');
        } finally {
            // 清理
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
                            {cardKeys.length > 0 && `，其中 ${cardKeys.filter(k => !k.usedAt).length} 个未使用`}
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
                            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors text-sm sm:text-base"
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
                            {newlyGeneratedKeys.map((key, index) => (
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

                <div className="grid gap-4">
                    {cardKeys.map((cardKey) => {
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

                    {cardKeys.length === 0 && (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed rounded-lg dark:border-gray-700 text-sm sm:text-base">
                            暂无卡密，点击"生成卡密"按钮创建新的卡密
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 