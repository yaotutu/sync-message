'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

export default function ProfilePage() {
    const params = useParams();
    const username = params?.username as string;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 验证密码
        if (!newPassword || !confirmPassword) {
            setError('请填写所有密码字段');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('两次输入的密码不一致');
            return;
        }

        if (newPassword.length < 6) {
            setError('密码长度至少为6位');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    newPassword,
                    currentPassword: localStorage.getItem('password'),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || '更新密码失败');
            }

            setSuccess('密码更新成功');
            setNewPassword('');
            setConfirmPassword('');
            localStorage.setItem('password', newPassword);
        } catch (err: any) {
            setError(err.message || '更新密码时发生错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                个人设置
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        修改密码
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                用户名
                            </label>
                            <input
                                type="text"
                                value={username}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-gray-100 dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                新密码
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500
                                         dark:focus:border-green-400 dark:focus:ring-green-400"
                                placeholder="输入新密码"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                确认新密码
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500
                                         dark:focus:border-green-400 dark:focus:ring-green-400"
                                placeholder="再次输入新密码"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        {success && (
                            <div className="text-green-500 text-sm">{success}</div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 
                                     border border-transparent rounded-md shadow-sm 
                                     text-sm font-medium text-white 
                                     bg-green-600 hover:bg-green-700 
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                                     dark:focus:ring-offset-gray-800
                                     disabled:opacity-50 disabled:cursor-not-allowed
                                     transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    更新中...
                                </div>
                            ) : (
                                '更新设置'
                            )}
                        </button>
                    </form>
                </div>

                {/* 预留空间给其他设置选项 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        其他设置
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        更多设置选项即将推出...
                    </p>
                </div>
            </div>
        </div>
    );
} 