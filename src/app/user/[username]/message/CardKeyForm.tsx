'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Message {
    id: string;
    content: string;
    receivedAt: Date;
}

interface CardKeyFormProps {
    username: string;
    error?: string;
}

interface ValidateResponse {
    success: boolean;
    message?: string;
    userId?: string;
    data?: {
        usedAt: string;
        expireTime: string;
        userId: string;
    };
}

interface MessagesResponse {
    success: boolean;
    message?: string;
    data?: Message[];
}

export default function CardKeyForm({ username, error }: CardKeyFormProps) {
    const [cardKey, setCardKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(error || '');
    const [messages, setMessages] = useState<Message[]>([]);
    const [cardKeyInfo, setCardKeyInfo] = useState<ValidateResponse['data']>();
    const [remainingTime, setRemainingTime] = useState<string>('');
    const [lastMessageId, setLastMessageId] = useState<string>('');

    const formatRemainingTime = (expireTime: Date) => {
        const now = new Date();
        const diff = expireTime.getTime() - now.getTime();

        if (diff <= 0) {
            setCardKeyInfo(undefined);
            setMessages([]);
            return '已过期';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${days}天${hours}小时${minutes}分${seconds}秒`;
    };

    // 获取消息的函数
    const fetchMessages = useCallback(async (userId: string) => {
        try {
            const messagesResponse = await fetch(`/api/messages/${userId}`);
            const messagesResult = await messagesResponse.json() as MessagesResponse;

            if (messagesResult.success && messagesResult.data) {
                // 检查是否有新消息
                const newMessages = messagesResult.data;
                if (newMessages.length > 0) {
                    const latestMessageId = newMessages[newMessages.length - 1].id;
                    if (latestMessageId !== lastMessageId) {
                        setMessages(newMessages);
                        setLastMessageId(latestMessageId);
                        // 如果有新消息，播放提示音
                        const audio = new Audio('/notification.mp3');
                        audio.play().catch(e => console.log('播放提示音失败:', e));
                    }
                }
            }
        } catch (err) {
            console.error('获取消息失败:', err);
        }
    }, [lastMessageId]);

    // 设置轮询
    useEffect(() => {
        if (cardKeyInfo?.userId) {
            // 立即获取一次消息
            fetchMessages(cardKeyInfo.userId);

            // 设置轮询间隔（每5秒）
            const pollInterval = setInterval(() => {
                fetchMessages(cardKeyInfo.userId);
            }, 5000);

            return () => clearInterval(pollInterval);
        }
    }, [cardKeyInfo?.userId, fetchMessages]);

    useEffect(() => {
        if (cardKeyInfo?.expireTime) {
            const timer = setInterval(() => {
                const expireTime = new Date(cardKeyInfo.expireTime);
                const timeStr = formatRemainingTime(expireTime);
                setRemainingTime(timeStr);
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [cardKeyInfo]);

    const validateCardKey = async (key: string) => {
        try {
            const response = await fetch('/api/cardkey/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key })
            });

            const result = await response.json() as ValidateResponse;

            if (result.success && result.data) {
                // 检查是否已过期
                const expireTime = new Date(result.data.expireTime);
                if (expireTime.getTime() < Date.now()) {
                    setErrorMessage('卡密已过期');
                    return { success: false };
                }

                setCardKeyInfo(result.data);
                // 获取消息
                const messagesResponse = await fetch(`/api/messages/${result.data.userId}`);
                const messagesResult = await messagesResponse.json() as MessagesResponse;

                if (messagesResult.success && messagesResult.data) {
                    setMessages(messagesResult.data);
                    if (messagesResult.data.length > 0) {
                        setLastMessageId(messagesResult.data[messagesResult.data.length - 1].id);
                    }
                }
            } else {
                setErrorMessage(result.message || '卡密验证失败');
            }

            return result;
        } catch (err) {
            console.error('验证卡密失败:', err);
            setErrorMessage('验证失败，请重试');
            return { success: false };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardKey.trim()) {
            setErrorMessage('请输入卡密');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        setCardKeyInfo(undefined);
        setMessages([]);
        setLastMessageId('');

        try {
            await validateCardKey(cardKey);
        } catch (err) {
            console.error('提交卡密失败:', err);
            setErrorMessage('提交失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                        消息查看
                    </h2>

                    {/* 卡密输入框 */}
                    <div className="mb-8">
                        <form className="max-w-md mx-auto" onSubmit={handleSubmit}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={cardKey}
                                    onChange={(e) => {
                                        const input = e.target as HTMLInputElement;
                                        setCardKey(input.value);
                                    }}
                                    placeholder="请输入卡密"
                                    className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                    disabled={isSubmitting}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {isSubmitting ? '验证中...' : '验证'}
                                </button>
                            </div>
                            {(errorMessage || error) && (
                                <div className="mt-2 text-red-500 text-sm text-center">
                                    {errorMessage || error}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* 卡密有效时显示信息 */}
                    {cardKeyInfo && (
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    卡密信息
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    <p>使用时间：{new Date(cardKeyInfo.usedAt).toLocaleString()}</p>
                                    <p>过期时间：{new Date(cardKeyInfo.expireTime).toLocaleString()}</p>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                                        剩余时间：{remainingTime}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    消息列表
                                </h3>
                                {messages.length > 0 ? (
                                    messages.map((message) => (
                                        <div key={message.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                            <p className="text-gray-900 dark:text-white">{message.content}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                {new Date(message.receivedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                        暂无消息
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 