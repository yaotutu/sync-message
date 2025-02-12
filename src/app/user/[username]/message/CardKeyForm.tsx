'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CardKeyFormProps {
    username: string;
    error?: string;
}

export default function CardKeyForm({ username, error }: CardKeyFormProps) {
    const [cardKey, setCardKey] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState(error || '');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardKey.trim()) {
            setErrorMessage('请输入卡密');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            // 设置cookie
            document.cookie = `cardKey=${cardKey}; path=/`;
            // 刷新页面以使用新的卡密
            router.refresh();
        } catch (err) {
            console.error('提交卡密失败:', err);
            setErrorMessage('提交失败，请重试');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        请输入卡密
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        输入有效的卡密以查看消息
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="cardKey" className="sr-only">
                            卡密
                        </label>
                        <input
                            id="cardKey"
                            name="cardKey"
                            type="text"
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                            placeholder="请输入卡密"
                            value={cardKey}
                            onChange={(e) => setCardKey(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {(errorMessage || error) && (
                        <div className="text-red-500 text-sm text-center">
                            {errorMessage || error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? '提交中...' : '提交'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 