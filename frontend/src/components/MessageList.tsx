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
        <div className="flex flex-col space-y-4 overflow-y-auto max-h-[600px] p-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className="bg-white rounded-lg shadow p-4"
                >
                    <div className="text-sm text-gray-500 mb-1">
                        {new Date(message.createdAt).toLocaleString()}
                    </div>
                    {message.type === 'text' ? (
                        <div className="text-gray-900">{message.content}</div>
                    ) : message.type === 'image' ? (
                        <img
                            src={message.content}
                            alt="图片消息"
                            className="max-w-full h-auto rounded"
                        />
                    ) : (
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <a
                                href={message.content}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                            >
                                下载文件
                            </a>
                        </div>
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
} 