'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageTemplate } from '@/lib/types/template';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

interface Message {
    id: string;
    content: string;
    receivedAt: string;
}

interface MessagePageProps {
    params: Promise<{ username: string }>;
}

export default function MessagePage({ params }: MessagePageProps) {
    const { username } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const cardkey = searchParams.get('cardkey');
    const appname = searchParams.get('appname');
    const t = searchParams.get('t');

    const [messages, setMessages] = useState<Message[]>([]);
    const [template, setTemplate] = useState<MessageTemplate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 验证参数
    useEffect(() => {
        if (!cardkey) {
            setError('缺少卡密参数');
            return;
        }
        if (!appname) {
            setError('缺少应用名称参数');
            return;
        }
        if (!t) {
            setError('缺少账号参数');
            return;
        }
    }, [cardkey, appname, t]);

    // 验证卡密
    useEffect(() => {
        const verifyCardKey = async () => {
            if (!cardkey || error) return;

            try {
                const response = await apiClient.post('/api/cardkeys/verify', {
                    key: cardkey,
                    username
                });

                if (!response.success) {
                    setError(response.message || '卡密验证失败');
                }
            } catch (error) {
                console.error('验证卡密失败:', error);
                setError('验证卡密失败');
            }
        };

        verifyCardKey();
    }, [cardkey, username, error]);

    // 获取消息模板
    useEffect(() => {
        const fetchTemplate = async () => {
            if (!appname || error) return;

            try {
                const response = await apiClient.get(`/api/templates/${appname}`);
                if (response.success && response.data?.template) {
                    setTemplate(response.data.template);
                } else {
                    setError('模板不存在');
                }
            } catch (error) {
                console.error('获取模板失败:', error);
                setError('获取模板失败');
            }
        };

        fetchTemplate();
    }, [appname, error]);

    // 获取消息列表
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await apiClient.get(`/api/user/${username}/messages/public`);
                if (response.success && response.data) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error('获取消息失败:', error);
                setError('获取消息失败');
            } finally {
                setIsLoading(false);
            }
        };

        if (template && !error) {
            fetchMessages();
        } else {
            setIsLoading(false);
        }
    }, [username, template, error]);

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

    // 复制文本
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('复制成功');
        } catch (err) {
            toast.error('复制失败');
        }
    };

    // 过滤符合规则的消息
    const filteredMessages = messages.filter(msg => validateMessage(msg.content));

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
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
        <div className="min-h-screen bg-[#fbfbfd]">
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
                    <h1 className="text-2xl font-semibold text-[#1d1d1f] text-center mb-8">
                        会员自助登录
                    </h1>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[#1d1d1f] text-sm mb-2">
                                    账号：
                                </label>
                                <input
                                    type="text"
                                    value={t || ''}
                                    readOnly
                                    className="w-full px-4 py-2 rounded-lg border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors text-[#1d1d1f] font-medium"
                                />
                            </div>
                            {filteredMessages.length > 0 && (
                                <div>
                                    <label className="block text-[#1d1d1f] text-sm mb-2">
                                        验证码：
                                    </label>
                                    <input
                                        type="text"
                                        value={filteredMessages[0].content.match(/\d{6}/)?.[0] || ''}
                                        readOnly
                                        className="w-full px-4 py-2 rounded-lg border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors text-[#1d1d1f] font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => handleCopy(t || '')}
                                className="w-full py-3 rounded-full bg-[#0066cc] text-white font-medium shadow-sm hover:bg-[#0077ed] active:bg-[#004499] transition-colors"
                            >
                                第一步：复制账号
                            </button>
                            {filteredMessages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => handleCopy(filteredMessages[0].content.match(/\d{6}/)?.[0] || '')}
                                    className="w-full py-3 rounded-full bg-[#0066cc] text-white font-medium shadow-sm hover:bg-[#0077ed] active:bg-[#004499] transition-colors"
                                >
                                    第二步：复制验证码
                                </button>
                            )}
                        </div>

                        {/* 帮助文档 */}
                        <div className="mt-8">
                            <div className="text-center text-[#0066cc] font-medium mb-4">
                                —— 如何使用 ——
                            </div>
                            <div className="text-[#86868b] text-sm space-y-2">
                                {template?.helpDoc ? (
                                    <pre className="whitespace-pre-wrap">{template.helpDoc}</pre>
                                ) : (
                                    <>
                                        <p>1.剪映APP点设置找回账号，输入本网站显示的账号点下一步。</p>
                                        <p>2.本页面复制验证码去APP登录即可</p>
                                        <p>3.不来验证码请在app重发一次验证码，还有问题请联系客服解决</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="text-[#ff3b30] text-sm text-center">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}