'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface CardKey {
    id: number;
    key: string;
    used: boolean;
    message: string;
    createdAt: number;
    usedAt?: number;
}

export default function CardsPage() {
    const params = useParams();
    const username = params?.username as string;

    const [cardKeys, setCardKeys] = useState<CardKey[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 新卡密表单状态
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        key: '',
        message: ''
    });

    // 加载卡密列表
    const loadCardKeys = async () => {
        try {
            const response = await fetch(`/api/user/${username}/cards`, {
                headers: {
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                }
            });
            const data = await response.json();
            if (data.success) {
                setCardKeys(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('加载卡密列表失败');
        }
    };

    useEffect(() => {
        loadCardKeys();
    }, [username]);

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await fetch(`/api/user/${username}/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setFormData({
                    key: '',
                    message: ''
                });
                loadCardKeys();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('添加卡密失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 删除卡密
    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这个卡密吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/${username}/cards?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                loadCardKeys();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('删除卡密失败，请稍后重试');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">卡密管理</h1>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setFormData({
                            key: '',
                            message: ''
                        });
                        setError('');
                        setSuccess('');
                    }}
                    className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md 
                             hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                >
                    {showForm ? '取消' : '添加卡密'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-300 p-4 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300 p-4 rounded-md">
                    {success}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        添加新卡密
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                卡密
                            </label>
                            <input
                                type="text"
                                name="key"
                                value={formData.key}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                消息内容
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                                         text-gray-700 dark:text-gray-300 rounded-md
                                         hover:bg-gray-50 dark:hover:bg-gray-700
                                         focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md
                                         hover:bg-green-600 dark:hover:bg-green-700
                                         focus:outline-none focus:ring-2 focus:ring-green-500
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {cardKeys.map(cardKey => (
                    <div
                        key={cardKey.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                    >
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                                        {cardKey.key}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${cardKey.used
                                        ? 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-300'
                                        : 'bg-green-100 dark:bg-green-900/50 text-green-500 dark:text-green-300'
                                        }`}>
                                        {cardKey.used ? '已使用' : '未使用'}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                    {cardKey.message}
                                </p>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    创建时间: {new Date(cardKey.createdAt * 1000).toLocaleString()}
                                    {cardKey.usedAt && (
                                        <div>
                                            使用时间: {new Date(cardKey.usedAt * 1000).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cardKey.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                            >
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 