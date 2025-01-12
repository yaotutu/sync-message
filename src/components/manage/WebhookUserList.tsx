'use client';

import { WebhookUser } from '@/types/manage';
import { useState } from 'react';

interface WebhookUserListProps {
    users: WebhookUser[];
    onRefresh: () => void;
    onDeleteUser: (username: string) => void;
}

export default function WebhookUserList({ users, onRefresh, onDeleteUser }: WebhookUserListProps) {
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyWebhookKey = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (error) {
            console.error('复制失败:', error);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Webhook 用户列表</h2>
                <button
                    onClick={onRefresh}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                    刷新列表
                </button>
            </div>
            <div className="space-y-3">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className="p-4 bg-white rounded-lg border border-gray-200"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">
                                    创建时间：{new Date(user.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => onDeleteUser(user.username)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                            >
                                删除
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 font-mono text-sm bg-gray-50 p-2 rounded break-all">
                                {user.webhookKey}
                            </div>
                            <button
                                onClick={() => copyWebhookKey(user.webhookKey)}
                                className={`px-3 py-1 rounded-md text-sm transition-colors ${copiedKey === user.webhookKey
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                            >
                                {copiedKey === user.webhookKey ? '已复制' : '复制'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 