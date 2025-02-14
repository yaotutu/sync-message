'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Message {
    id: string;
    content: string;
    createdAt: string;
    type: string;
}

interface InboxPageProps {
    params: Promise<{ username: string }>;
}

export default function InboxPage({ params }: InboxPageProps) {
    const { username } = use(params);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMessages() {
            try {
                setError(null);
                const response = await fetch(`/api/messages/${username}`);
                if (!response.ok) {
                    throw new Error('获取消息失败');
                }
                const data = await response.json();
                setMessages(data.messages || []);
            } catch (error) {
                console.error('获取消息失败:', error);
                setError(error instanceof Error ? error.message : '获取消息失败');
                setMessages([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMessages();
    }, [username]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">加载失败</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">消息记录</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    共 {messages.length} 条消息
                </span>
            </div>

            <div className="space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无消息</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">新的消息将会在这里显示</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1 flex-1">
                                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {format(new Date(message.createdAt), 'yyyy年MM月dd日 HH:mm:ss', { locale: zhCN })}
                                        </span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                            {message.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
} 