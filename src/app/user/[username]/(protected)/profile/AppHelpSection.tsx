'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';

interface AppHelp {
    id: string;
    appName: string;
    helpText: string;
}

interface AppHelpSectionProps {
    username: string;
}

export default function AppHelpSection({ username }: AppHelpSectionProps) {
    const [appHelps, setAppHelps] = useState<AppHelp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAppHelp, setNewAppHelp] = useState({ appName: '', helpText: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadAppHelps();
    }, [username]);

    const loadAppHelps = async () => {
        try {
            const data = await apiClient.get(`/api/user/${username}/app-helps`);
            if (data.success) {
                setAppHelps(data.data || []);
            }
        } catch (err) {
            toast.error('加载应用帮助文档失败');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAppHelp.appName || !newAppHelp.helpText) {
            toast.error('应用名称和帮助文档内容不能为空');
            return;
        }

        setIsAdding(true);
        try {
            const data = await apiClient.post(`/api/user/${username}/app-helps`, newAppHelp);
            if (data.success) {
                toast.success('添加成功');
                setNewAppHelp({ appName: '', helpText: '' });
                await loadAppHelps();
            }
        } catch (err) {
            toast.error('添加失败');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (appName: string) => {
        if (!confirm('确定要删除这个应用帮助文档吗？')) {
            return;
        }

        try {
            const data = await apiClient.delete(`/api/user/${username}/app-helps/${appName}`);
            if (data.success) {
                toast.success('删除成功');
                await loadAppHelps();
            }
        } catch (err) {
            toast.error('删除失败');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">应用帮助文档管理</h2>

            {/* 添加新应用帮助文档表单 */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        应用名称
                    </label>
                    <input
                        type="text"
                        value={newAppHelp.appName}
                        onChange={(e) => setNewAppHelp({ ...newAppHelp, appName: e.target.value })}
                        placeholder="请输入应用名称"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        帮助文档内容
                    </label>
                    <textarea
                        value={newAppHelp.helpText}
                        onChange={(e) => setNewAppHelp({ ...newAppHelp, helpText: e.target.value })}
                        placeholder="请输入帮助文档内容，支持换行"
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isAdding}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isAdding ? '添加中...' : '添加'}
                </button>
            </form>

            {/* 现有应用帮助文档列表 */}
            <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">现有应用帮助文档</h3>
                <div className="space-y-4">
                    {appHelps.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">暂无应用帮助文档</p>
                    ) : (
                        appHelps.map((appHelp) => (
                            <div
                                key={appHelp.id}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 relative group"
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {appHelp.appName}
                                    </h4>
                                    <button
                                        onClick={() => handleDelete(appHelp.appName)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        删除
                                    </button>
                                </div>
                                <pre className="mt-2 text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {appHelp.helpText}
                                </pre>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 