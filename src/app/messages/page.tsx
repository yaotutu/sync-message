'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/types/message';
import MessageList from '@/components/MessageList';
import Countdown from '@/components/Countdown';

export default function MessagesPage() {
    const [cardKey, setCardKey] = useState('');
    const [error, setError] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [expiresIn, setExpiresIn] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidated, setIsValidated] = useState(false);

    // 验证卡密并获取消息
    const fetchMessages = useCallback(async () => {
        if (!cardKey) return;

        try {
            const response = await fetch('/api/messages', {
                headers: { 'x-card-key': cardKey }
            });

            const data = await response.json();
            if (data.success && data.data) {
                setMessages(data.data);
                if (data.expiresIn !== undefined) {
                    const expiresInMs = data.expiresIn;
                    setExpiresIn(Math.floor(expiresInMs / 1000));
                }
                setError('');
                setIsValidated(true);
            } else {
                setError(data.message || '加载消息失败');
                if (data.expired) {
                    handleLogout();
                }
            }
        } catch (error) {
            console.error('Load messages error:', error);
            setError('加载消息失败，请稍后重试');
        }
    }, [cardKey]);

    // 提交卡密
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardKey.trim()) {
            setError('请输入卡密');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/cardkey/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: cardKey.trim() })
            });

            const data = await response.json();
            if (data.success) {
                setError('');
                // 验证成功后立即获取消息
                await fetchMessages();
            } else {
                setError(data.message || '卡密验证失败');
                setCardKey('');
                setIsValidated(false);
            }
        } catch (error) {
            console.error('Validate error:', error);
            setError('卡密验证失败，请稍后重试');
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
        setError('');
        setIsValidated(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!isValidated ? (
                    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">消息查看</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="cardKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    卡密
                                </label>
                                <input
                                    id="cardKey"
                                    type="text"
                                    value={cardKey}
                                    onChange={(e) => setCardKey(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm sm:text-base"
                                    placeholder="请输入卡密"
                                />
                            </div>
                            {error && (
                                <div className="text-red-500 dark:text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                            >
                                {isLoading ? '验证中...' : '验证'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">消息列表</h1>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">卡密过期时间：</span>
                                        <Countdown expiresIn={expiresIn} onExpire={handleLogout} />
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 text-sm sm:text-base"
                                >
                                    退出
                                </button>
                            </div>
                            {error && (
                                <div className="mb-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded relative text-sm sm:text-base">
                                    {error}
                                </div>
                            )}
                            <MessageList messages={messages} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 