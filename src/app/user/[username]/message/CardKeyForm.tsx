'use client';

import React, { useState } from 'react';
import { cardKeyService } from '@/lib/api/services';

interface CardKeyFormProps {
    username: string;
    onVerified: () => void;
    initialCardKey?: string | null;
    initialPhone?: string | null;
}

export default function CardKeyForm({ username, onVerified, initialCardKey = '', initialPhone = '' }: CardKeyFormProps) {
    const [cardKey, setCardKey] = useState(initialCardKey || '');
    const [phone, setPhone] = useState(initialPhone || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await cardKeyService.verifyCardKey(username, { cardKey, phone });

            if (response.success) {
                onVerified();
            } else {
                setError(response.message || '验证失败');
            }
        } catch (error) {
            setError('验证过程中出现错误');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="cardKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    卡密
                </label>
                <input
                    type="text"
                    id="cardKey"
                    value={cardKey}
                    onChange={(e) => setCardKey(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="请输入卡密"
                    required
                />
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    手机号（选填）
                </label>
                <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="请输入手机号"
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? '验证中...' : '验证卡密'}
            </button>
        </form>
    );
} 