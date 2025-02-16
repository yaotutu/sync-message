'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

interface MessagePageProps {
    params: Promise<{ username: string }>;
}

interface UserConfig {
    title?: string;
}

export default function MessagePage({ params }: MessagePageProps) {
    const { username } = use(params);
    const searchParams = useSearchParams();
    const [isVerified, setIsVerified] = useState(false);
    const [account, setAccount] = useState(searchParams.get('t') || '');
    const [verifyCode, setVerifyCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userConfig, setUserConfig] = useState<UserConfig>({});

    // 获取用户配置
    useEffect(() => {
        async function fetchUserConfig() {
            try {
                const response = await fetch(`/api/user/${username}/config`);
                const data = await response.json();
                if (data.success) {
                    setUserConfig(data.data || {});
                }
            } catch (error) {
                console.error('获取用户配置失败:', error);
            }
        }

        fetchUserConfig();
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // TODO: 实现验证逻辑
            setIsVerified(true);
        } catch (error) {
            setError('验证失败，请重试');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-8">
                        {/* 标题区域 */}
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {userConfig.title || '会员自助登录'}
                            </h1>
                        </div>

                        {/* 表单区域 */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    账号
                                </label>
                                <input
                                    type="text"
                                    id="account"
                                    value={account}
                                    onChange={(e) => setAccount(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="verifyCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    验证码
                                </label>
                                <input
                                    type="text"
                                    id="verifyCode"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* 复制按钮区域 */}
                            <div className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => {/* TODO: 实现复制账号功能 */ }}
                                    className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium hover:from-orange-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                                >
                                    第一步：复制账号
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {/* TODO: 实现复制验证码功能 */ }}
                                    className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-orange-400 to-pink-500 text-white font-medium hover:from-orange-500 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                                >
                                    第二步：复制验证码
                                </button>
                            </div>

                            {/* 使用说明区域 */}
                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4">
                                    如何使用
                                </h3>
                                <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                    <p>1.剪映APP点设置找回账号，输入本网站显示的账号点下一步。</p>
                                    <p>2.本页面复制验证码去APP登录即可</p>
                                    <p>3.不来验证码请在app重发一次验证码，还有问题请联系客服解决</p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // TODO: 实现已验证后的消息展示界面
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        消息列表
                    </h1>
                    <div className="text-gray-600 dark:text-gray-400">
                        消息内容将在这里显示...
                    </div>
                </div>
            </div>
        </div>
    );
}