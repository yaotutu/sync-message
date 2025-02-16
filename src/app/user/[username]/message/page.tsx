'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

interface MessagePageProps {
    params: Promise<{ username: string }>;
}

interface AppHelp {
    appName: string;
    helpText: string;
}

interface UserConfig {
    title?: string;
    appHelps?: AppHelp[];
}

export default function MessagePage({ params }: MessagePageProps) {
    const { username } = use(params);
    const searchParams = useSearchParams();
    const t = searchParams.get('t');
    const [userConfig, setUserConfig] = useState<UserConfig>({});
    const [isLoading, setIsLoading] = useState(true);
    const [verifyCode, setVerifyCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserConfig();
    }, [username]);

    const loadUserConfig = async () => {
        try {
            const response = await fetch(`/api/user/${username}/config`);
            const data = await response.json();
            if (data.success) {
                setUserConfig(data.data || {});
            }
        } catch (err) {
            console.error('加载用户配置失败:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!t || !verifyCode) {
            setError('账号和验证码不能为空');
            return;
        }

        // TODO: 实现验证逻辑
        setIsVerified(true);
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('复制成功');
        } catch (err) {
            toast.error('复制失败');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {userConfig.title || '消息查看'}
                    </h1>

                    {!isVerified ? (
                        <div className="space-y-6">
                            {/* 帮助文档 */}
                            {userConfig.appHelps?.map((appHelp) => (
                                appHelp.appName === t && (
                                    <div key={appHelp.appName} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                            {appHelp.helpText}
                                        </pre>
                                    </div>
                                )
                            ))}

                            {/* 验证表单 */}
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        账号
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            value={t || ''}
                                            readOnly
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(t || '')}
                                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            复制
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        验证码
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            value={verifyCode}
                                            onChange={(e) => setVerifyCode(e.target.value)}
                                            placeholder="请输入验证码"
                                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(verifyCode)}
                                            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            复制
                                        </button>
                                    </div>
                                </div>
                                {error && (
                                    <div className="text-red-500 text-sm">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    验证
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            {/* TODO: 显示消息列表 */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}