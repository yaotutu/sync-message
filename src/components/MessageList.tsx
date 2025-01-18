'use client';

import { Message } from '@/types/message';

interface MessageListProps {
    messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
    // 对消息进行排序，最新的消息在最上面
    const sortedMessages = [...messages].sort((a, b) => {
        const timeA = a.rec_time ? new Date(a.rec_time).getTime() : a.received_at;
        const timeB = b.rec_time ? new Date(b.rec_time).getTime() : b.received_at;
        return timeB - timeA;
    });

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg flex flex-col h-[calc(100vh-16rem)]">
            {sortedMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">暂无消息</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {sortedMessages.map((message) => (
                            <div
                                key={message.id}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
                            >
                                <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words leading-relaxed">
                                    {message.sms_content}
                                </div>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                        <span className="mb-1 sm:mb-0">用户名: {message.username}</span>
                                        <span>
                                            接收时间: {message.rec_time || new Date(message.received_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 