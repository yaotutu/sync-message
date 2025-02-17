'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { MessageTemplate } from '@/lib/types/template';
import { apiClient } from '@/lib/api/client';

interface Message {
    id: string;
    content: string;
    receivedAt: string;
}

export default function MessagePage({
    params
}: {
    params: { username: string; appName: string }
}) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth(params.username);
    const [messages, setMessages] = useState<Message[]>([]);
    const [template, setTemplate] = useState<MessageTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 获取消息模板
    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const { data } = await apiClient.get(`/api/templates/${params.appName}`);

                if (data?.template) {
                    setTemplate(data.template);
                } else {
                    setError('模板不存在');
                }
            } catch (error) {
                console.error('获取模板失败:', error);
                setError('获取模板失败');
            }
        };

        if (isAuthenticated) {
            fetchTemplate();
        }
    }, [isAuthenticated, params.appName]);

    // 获取消息列表
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await apiClient.get(`/api/user/${params.username}/messages`);

                if (data) {
                    setMessages(data);
                }
            } catch (error) {
                console.error('获取消息失败:', error);
                setError('获取消息失败');
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && template) {
            fetchMessages();
        }
    }, [isAuthenticated, params.username, template]);

    // 验证消息是否符合模板规则
    const validateMessage = (message: string) => {
        if (!template) return false;

        for (const rule of template.rules) {
            const pattern = rule.pattern;
            const isValid = rule.ruleType === 'CONTAINS'
                ? message.includes(pattern)
                : !message.includes(pattern);

            if (!isValid) {
                return false;
            }
        }

        return true;
    };

    // 过滤符合规则的消息
    const filteredMessages = messages.filter(msg => validateMessage(msg.content));

    if (loading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        router.push(`/user/${params.username}/login`);
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center text-red-500">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {template?.appName} 验证码消息
                    </h1>
                    {template?.helpDoc && (
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {template.helpDoc}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    {filteredMessages.length > 0 ? (
                        filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="text-gray-900 dark:text-white">
                                    {message.content}
                                </div>
                                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(message.receivedAt).toLocaleString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            暂无符合规则的消息
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 