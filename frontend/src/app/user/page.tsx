'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/types/message';
import MessageList from '@/components/MessageList';

export default function UserPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [webhookKey, setWebhookKey] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = async () => {
        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        setIsLoading(true);
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
                setIsLoggedIn(true);
                setWebhookKey(data.webhookKey);
                setError('');
                loadMessages();
            } else {
                setError(data.message || '登录失败');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('登录失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/user/messages', {
                headers: {
                    'x-username': username,
                    'x-password': password
                }
            });

            const data = await response.json();
            if (data.success) {
                setMessages(data.messages || []);
                setError('');
            } else {
                setError(data.message || '加载消息失败');
            }
        } catch (error) {
            console.error('Load messages error:', error);
            setError('加载消息失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    const copyWebhookKey = async () => {
        try {
            await navigator.clipboard.writeText(webhookKey);
            alert('Webhook Key 已复制到剪贴板');
        } catch (error) {
            console.error('Copy webhook key error:', error);
            alert('复制失败，请手动复制');
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isLoggedIn) {
            timer = setInterval(loadMessages, 5000); // 每5秒刷新一次消息
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [isLoggedIn]);

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
                                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="请输入用户名"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">密码</label>
                                        <input
                                            type="password"
                                            className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && login()}
                                            placeholder="请输入密码"
                                        />
                                    </div>
                                    {error && (
                                        <div className="text-red-500 text-sm mt-2">
                                            {error}
                                        </div>
                                    )}
                                    <button
                                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={login}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? '登录中...' : '登录'}
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
        <div className="min-h-screen bg-gray-100 py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="sm:flex sm:items-center sm:justify-between">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Webhook Key
                            </h3>
                            <button
                                onClick={copyWebhookKey}
                                className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                复制
                            </button>
                        </div>
                        <div className="mt-2 sm:flex sm:items-center">
                            <div className="w-full text-sm text-gray-500 bg-gray-50 rounded p-3 font-mono break-all">
                                {webhookKey}
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-5 sm:p-6">
                        <div className="sm:flex sm:items-center">
                            <div className="sm:flex-auto">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    消息列表
                                </h3>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                                <button
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={loadMessages}
                                >
                                    刷新
                                </button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <MessageList messages={messages} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 