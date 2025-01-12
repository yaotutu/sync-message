'use client';

import { useRef, useEffect } from 'react';
import { Message } from '@/types/message';

interface MessageListProps {
    messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex flex-col space-y-4 h-[600px] overflow-y-auto p-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow"
                >
                    <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {message.sms_content}
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex flex-col">
                        <span>用户名: {message.username}</span>
                        {message.rec_time ? (
                            <span>接收时间: {message.rec_time}</span>
                        ) : (
                            <span>接收时间: {new Date(message.received_at).toLocaleString()}</span>
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
} 