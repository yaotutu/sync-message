'use client';

import React from 'react';
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

    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        if (savedUsername && savedPassword) {
            setUsername(savedUsername);
            setPassword(savedPassword);
            setIsLoggedIn(true);
            fetchCardKeys();
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoggedIn) {
            interval = setInterval(fetchCardKeys, 5000); // 每5秒刷新一次
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isLoggedIn]);

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
                fetchCardKeys();
            } else {
                setError(data.message || '登录失败');
            }
        } catch (error) {
            setError('登录失败，请稍后重试');
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

    const fetchCardKeys = async () => {
        try {
            const response = await fetch('/api/user/cardkeys', {
                headers: {
                    'x-username': username,
                    'x-password': password
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
            const promises = Array(generatingCount).fill(0).map(() =>
                fetch('/api/user/cardkeys', {
                    method: 'POST',
                    headers: {
                        'x-username': username,
                        'x-password': password
                    }
                })
            );

            const results = await Promise.all(promises);
            const allSuccessful = results.every(res => res.ok);

            if (allSuccessful) {
                fetchCardKeys();
            } else {
                setError('部分卡密生成失败');
            }
        } catch (error) {
            setError('生成卡密失败，请稍后重试');
        }
    };

    const deleteCardKey = async (key: string) => {
        try {
            const response = await fetch(`/api/user/cardkeys/${key}`, {
                method: 'DELETE',
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                fetchCardKeys();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('删除卡密失败，请稍后重试');
        }
    };

    const formatTime = (ms: number) => {
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

    if (loading) {
        return <div className="p-4">加载中...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                        <div className="max-w-md mx-auto">
                            <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div className="flex flex-col">
                                        <label className="leading-loose">用户名</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                            placeholder="请输入用户名"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">密码</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && login()}
                                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                            placeholder="请输入密码"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-500 text-sm">{error}</div>
                                    )}
                                    <button
                                        onClick={login}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
                                    >
                                        登录
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold">卡密管理</h1>
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                退出登录
                            </button>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            当前共有 {cardKeys.length} 个卡密
                            {cardKeys.length > 0 && `，其中 ${cardKeys.filter(k => !k.usedAt).length} 个未使用`}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm">生成数量:</label>
                            <select
                                value={generatingCount}
                                onChange={(e) => setGeneratingCount(Number(e.target.value))}
                                className="border rounded px-2 py-1"
                            >
                                {[1, 5, 10, 20].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={generateCardKeys}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                        >
                            生成卡密
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid gap-4">
                    {cardKeys.map((cardKey) => {
                        const status = getStatusText(cardKey);
                        return (
                            <div
                                key={cardKey.id}
                                className={`border rounded-lg p-4 flex justify-between items-center ${status.bgColor} hover:shadow-md transition-shadow`}
                            >
                                <div className="space-y-1 flex-1">
                                    <div className="font-mono text-lg flex items-center gap-2">
                                        {cardKey.key}
                                        <span className={`text-sm px-2 py-0.5 rounded-full ${status.color} ${status.bgColor} border border-current`}>
                                            {status.text}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        创建时间: {new Date(cardKey.createdAt).toLocaleString()}
                                    </div>
                                    {cardKey.usedAt && (
                                        <div className="text-sm text-gray-500">
                                            使用时间: {new Date(cardKey.usedAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteCardKey(cardKey.key)}
                                    className="text-red-500 hover:text-red-700 transition-colors ml-4"
                                >
                                    删除
                                </button>
                            </div>
                        );
                    })}

                    {cardKeys.length === 0 && (
                        <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                            暂无卡密，点击"生成卡密"按钮创建新的卡密
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 