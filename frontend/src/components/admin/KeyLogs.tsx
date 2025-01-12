'use client';

import { KeyLog } from '@/types/admin';

interface KeyLogsProps {
    logs: KeyLog[];
    onRefresh: () => void;
}

export default function KeyLogs({ logs, onRefresh }: KeyLogsProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">卡密使用记录</h2>
                <button
                    onClick={onRefresh}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                    刷新记录
                </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 font-medium">
                    <div>卡密</div>
                    <div>用户</div>
                    <div>状态</div>
                </div>
                <div className="divide-y">
                    {logs.map((log) => (
                        <div key={log.id} className="grid grid-cols-3 gap-4 p-4">
                            <div className="break-all">{log.key}</div>
                            <div>{log.username}</div>
                            <div className={log.status === 'success' ? 'text-green-500' : 'text-red-500'}>
                                {log.status === 'success' ? '成功' : '无效'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 