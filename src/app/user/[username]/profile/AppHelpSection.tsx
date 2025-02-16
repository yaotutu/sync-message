'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAppHelp, setCurrentAppHelp] = useState<Partial<AppHelp>>({});

    // 获取应用帮助文档列表
    const fetchAppHelps = async () => {
        try {
            const response = await fetch(`/api/user/${username}/config/app-helps`);
            const data = await response.json();
            if (data.success) {
                setAppHelps(data.data);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('获取应用帮助文档失败');
        } finally {
            setIsLoading(false);
        }
    };

    // 保存应用帮助文档
    const handleSave = async () => {
        if (!currentAppHelp.appName || !currentAppHelp.helpText) {
            setError('应用名称和帮助文档不能为空');
            return;
        }

        try {
            const response = await fetch(`/api/user/${username}/config/app-helps`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    appName: currentAppHelp.appName,
                    helpText: currentAppHelp.helpText,
                }),
            });

            const data = await response.json();
            if (data.success) {
                await fetchAppHelps();
                setIsDialogOpen(false);
                setCurrentAppHelp({});
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('保存失败');
        }
    };

    // 删除应用帮助文档
    const handleDelete = async (appName: string) => {
        if (!confirm('确定要删除这个应用帮助文档吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/${username}/config/app-helps?appName=${appName}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                await fetchAppHelps();
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('删除失败');
        }
    };

    useEffect(() => {
        fetchAppHelps();
    }, [username]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    应用帮助文档
                </h2>
                <button
                    onClick={() => {
                        setCurrentAppHelp({});
                        setIsDialogOpen(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    添加应用帮助
                </button>
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {appHelps.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            暂无应用帮助文档
                        </div>
                    ) : (
                        appHelps.map((appHelp) => (
                            <div
                                key={appHelp.id}
                                className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {appHelp.appName}
                                        </h3>
                                        <pre className="mt-2 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                            {appHelp.helpText}
                                        </pre>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setCurrentAppHelp(appHelp);
                                                setIsDialogOpen(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDelete(appHelp.appName)}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* 编辑对话框 */}
            <Transition appear show={isDialogOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsDialogOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                                    >
                                        {currentAppHelp.id ? '编辑应用帮助' : '添加应用帮助'}
                                    </Dialog.Title>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                应用名称
                                            </label>
                                            <input
                                                type="text"
                                                value={currentAppHelp.appName || ''}
                                                onChange={(e) => setCurrentAppHelp(prev => ({
                                                    ...prev,
                                                    appName: e.target.value
                                                }))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                                placeholder="例如：jianying"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                帮助文档
                                            </label>
                                            <textarea
                                                value={currentAppHelp.helpText || ''}
                                                onChange={(e) => setCurrentAppHelp(prev => ({
                                                    ...prev,
                                                    helpText: e.target.value
                                                }))}
                                                rows={6}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                                placeholder="请输入帮助文档内容，支持换行..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end space-x-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            取消
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={handleSave}
                                        >
                                            保存
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
} 