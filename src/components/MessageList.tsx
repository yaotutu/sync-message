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
        <div className="flex flex-col space-y-4 h-[calc(100vh-16rem)] sm:h-[600px] overflow-y-auto p-2 sm:p-4">
            {sortedMessages.map((message) => (
                <div
                    key={message.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 shadow"
                >
                    <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {message.sms_content}
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-col">
                        <span>用户名: {message.username}</span>
                        {message.rec_time ? (
                            <span>接收时间: {message.rec_time}</span>
                        ) : (
                            <span>接收时间: {new Date(message.received_at).toLocaleString()}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
} 