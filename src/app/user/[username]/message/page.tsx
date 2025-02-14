'use client';

import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import CardKeyForm from './CardKeyForm';

interface MessagePageProps {
    params: Promise<{ username: string }>;
}

const APP_HELP_TEXTS = {
    jianying: {
        title: '剪映使用教程',
        steps: [
            '打开剪映APP，点击设置',
            '找到账号管理选项',
            '输入卡密进行登录',
            '登录成功后即可查看消息'
        ]
    },
    douyin: {
        title: '抖音使用教程',
        steps: [
            '打开抖音APP，进入个人页面',
            '点击设置图标',
            '找到账号与安全',
            '输入卡密完成验证'
        ]
    },
    other: {
        title: '使用说明',
        steps: [
            '请妥善保管您的卡密',
            '卡密用于查看消息',
            '如有问题请联系客服'
        ]
    }
};

export default function MessagePage({ params }: MessagePageProps) {
    const { username } = use(params);
    const searchParams = useSearchParams();
    const [isVerified, setIsVerified] = useState(false);
    const [messages, setMessages] = useState([]);

    const cardKey = searchParams.get('cardkey');
    const phone = searchParams.get('t');
    const appName = searchParams.get('appname') || 'other';

    const helpText = APP_HELP_TEXTS[appName as keyof typeof APP_HELP_TEXTS] || APP_HELP_TEXTS.other;

    if (!isVerified) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {helpText.title}
                        </h1>

                        <div className="mb-8">
                            <div className="space-y-4">
                                {helpText.steps.map((step, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <p className="ml-3 text-gray-600 dark:text-gray-300">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <CardKeyForm
                            username={username}
                            onVerified={() => setIsVerified(true)}
                            initialCardKey={cardKey}
                            initialPhone={phone}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // ... rest of the code for displaying messages ...
}