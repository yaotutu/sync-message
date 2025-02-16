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
    const appname = searchParams.get('appname');
    const cardkey = searchParams.get('cardkey');
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
            <div className="flex justify-center items-center min-h-screen bg-[#fbfbfd]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
            </div>
        );
    }

    // 找到匹配的帮助文档
    const matchedHelp = userConfig.appHelps?.find(
        help => help.appName.toLowerCase() === appname?.toLowerCase()
    );

    return (
        <div className="min-h-screen bg-[#fbfbfd]">
            <div className="max-w-md mx-auto px-4 py-8">
                <div className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-6">
                    <h1 className="text-2xl font-semibold text-[#1d1d1f] text-center mb-8">
                        会员自助登录
                    </h1>

                    {!isVerified ? (
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
                                <div>
                                    <label className="block text-[#1d1d1f] text-sm mb-2">
                                        验证码：
                                    </label>
                                    <input
                                        type="text"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors text-[#1d1d1f] font-medium"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => handleCopy(t || '')}
                                    className="w-full py-3 rounded-full bg-[#0066cc] text-white font-medium shadow-sm hover:bg-[#0077ed] active:bg-[#004499] transition-colors"
                                >
                                    第一步：复制账号
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(verifyCode)}
                                    className="w-full py-3 rounded-full bg-[#0066cc] text-white font-medium shadow-sm hover:bg-[#0077ed] active:bg-[#004499] transition-colors"
                                >
                                    第二步：复制验证码
                                </button>
                            </div>

                            {/* 帮助文档 */}
                            <div className="mt-8">
                                <div className="text-center text-[#0066cc] font-medium mb-4">
                                    —— 如何使用 ——
                                </div>
                                <div className="text-[#86868b] text-sm space-y-2">
                                    {matchedHelp ? (
                                        <pre className="whitespace-pre-wrap">{matchedHelp.helpText}</pre>
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