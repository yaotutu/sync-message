'use client';

import React, { useEffect, useState } from 'react';

interface AdminInfo {
    username: string;
}

export default function DashboardPage() {
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);

    useEffect(() => {
        const fetchAdminInfo = async () => {
            try {
                const response = await fetch('/api/manage/verify');
                const data = await response.json();

                if (data.success && data.data?.admin) {
                    setAdminInfo(data.data.admin);
                }
            } catch (error) {
                console.error('获取管理员信息失败:', error);
            }
        };

        fetchAdminInfo();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    管理员仪表盘
                </h1>
                {adminInfo && (
                    <div className="text-gray-600 dark:text-gray-300">
                        <p>欢迎回来，{adminInfo.username}</p>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {/* 这里可以添加仪表盘卡片 */}
                </div>
            </div>
        </div>
    );
} 