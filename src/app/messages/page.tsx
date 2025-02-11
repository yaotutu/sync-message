'use client';

import Countdown from '@/components/Countdown';
import MessageList from '@/components/MessageList';
import React, { useCallback, useEffect, useState } from 'react';

interface Product {
    id: string;
    title: string;
    imageUrl?: string;
    link: string;
    price?: number;
    description?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export default function MessagesPage() {
    const [cardKey, setCardKey] = useState('');
    const [error, setError] = useState('');
    const [messages, setMessages] = useState<Product[]>([]);
    const [expiresIn, setExpiresIn] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    // 验证卡密并获取消息
    const fetchMessages = useCallback(async () => {
        if (!cardKey || !username) return;

        try {
            const response = await fetch(`/api/user/${username}/message?key=${encodeURIComponent(cardKey)}`);

            const data = await response.json();
            if (data.success && data.data) {
                setMessages(data.data.products || []);
                setError('');
                setIsValidated(true);

                // 设置过期时间
                if (data.expiresIn !== undefined) {
                    const expiresInMs = data.expiresIn;
                    setExpiresIn(Math.floor(expiresInMs / 1000));
                }
            } else {
                if (data.expired) {
                    handleLogout();
                    setError('卡密已过期，请重新输入');
                } else {
                    setError(data.message || '加载消息失败');
                }
            }
        } catch (error) {
            console.error('Load messages error:', error);
            setError('加载消息失败，请稍后重试');
        }
    }, [cardKey, username]);

    // 提交卡密和用户名
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardKey.trim()) {
            setError('请输入卡密');
            return;
        }

        if (!username?.trim()) {
            setError('请输入用户名');
            return;
        }

        setIsLoading(true);
        try {
            await fetchMessages();
        } catch (error) {
            console.error('Validate error:', error);
            setError('验证失败，请稍后重试');
            setIsValidated(false);
        } finally {
            setIsLoading(false);
        }
    };

    // 定时刷新消息
    useEffect(() => {
        if (isValidated) {
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [isValidated, fetchMessages]);

    // 处理退出
    const handleLogout = () => {
        setCardKey('');
        setMessages([]);
        setExpiresIn(0);
        setIsValidated(false);
        setUsername(null);
    };

    // 处理卡密过期
    const handleExpire = () => {
        handleLogout();
        setError('卡密已过期，请重新输入');
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {!isValidated ? (
                <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                        商品查询系统
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                用户名
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username || ''}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="输入用户名"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="cardKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                卡密
                            </label>
                            <input
                                type="text"
                                id="cardKey"
                                value={cardKey}
                                onChange={(e) => setCardKey(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                placeholder="输入卡密"
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <div className="text-red-500 text-sm mt-2">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? '验证中...' : '验证'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mb-4">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Countdown expiresIn={expiresIn} onExpire={handleExpire} />
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-150 ease-in-out"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                    <MessageList messages={messages} />
                </div>
            )}
        </div>
    );
}