'use client';

import React, { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('页面错误:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        出错了
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {error.message || '发生了一些错误，请稍后重试'}
                    </p>
                    <button
                        onClick={reset}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        重试
                    </button>
                </div>
            </div>
        </div>
    );
} 