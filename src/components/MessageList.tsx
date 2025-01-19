'use client';

import { Message } from '@/types/message';

interface MessageListProps {
    messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(message.createdAt).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {message.sender}
                        </span>
                    </div>
                    {message.type === 'text' && (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {message.content}
                        </p>
                    )}
                    {message.type === 'image' && message.metadata?.url && (
                        <img
                            src={message.metadata.url}
                            alt={message.content}
                            className="max-w-full h-auto rounded-lg"
                        />
                    )}
                    {message.type === 'file' && message.metadata && (
                        <div className="flex items-center space-x-2">
                            <svg
                                className="w-6 h-6 text-gray-500 dark:text-gray-400"
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
                                href={message.metadata.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                {message.metadata.filename}
                                {message.metadata.filesize && (
                                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                        ({Math.round(message.metadata.filesize / 1024)}KB)
                                    </span>
                                )}
                            </a>
                        </div>
                    )}
                </div>
            ))}
            {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    暂无消息
                </div>
            )}
        </div>
    );
} 