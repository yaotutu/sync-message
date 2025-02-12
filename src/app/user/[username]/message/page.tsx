import React from 'react';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import CardKeyForm from './CardKeyForm';

interface Product {
    id: string;
    title: string;
    imageUrl?: string;
    link?: string;
    price?: number;
    description?: string;
    notes?: string;
}

interface UserConfig {
    pageTitle?: string;
    pageDescription?: string;
}

interface Message {
    id: string;
    content: string;
    receivedAt: Date;
}

interface ValidateResponse {
    success: boolean;
    message?: string;
    userId?: string;
}

interface MessagesResponse {
    success: boolean;
    message?: string;
    data?: Message[];
}

export default async function MessagePage({ params }: { params: { username: string } }) {
    const cookieStore = await cookies();
    const headersList = await headers();
    const cardKey = cookieStore.get('cardKey')?.value;
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    if (!cardKey) {
        return <CardKeyForm username={params.username} />;
    }

    try {
        const response = await fetch(`${baseUrl}/api/cardkey/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: cardKey })
        });

        const validateResult = (await response.json()) as ValidateResponse;

        if (!validateResult.success || !validateResult.userId) {
            return <CardKeyForm username={params.username} error="卡密无效，请重新输入" />;
        }

        const messagesResponse = await fetch(`${baseUrl}/api/messages/${validateResult.userId}`);
        const messagesResult = (await messagesResponse.json()) as MessagesResponse;

        if (!messagesResult.success || !messagesResult.data) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">获取消息失败</h1>
                        <p className="text-gray-600">请稍后再试</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">消息列表</h1>
                <div className="space-y-4">
                    {messagesResult.data.map((message: Message) => (
                        <div key={message.id} className="bg-white p-4 rounded-lg shadow">
                            <p className="text-gray-800">{message.content}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {new Date(message.receivedAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                    {messagesResult.data.length === 0 && (
                        <p className="text-center text-gray-600">暂无消息</p>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Error fetching data:', error);
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">系统错误</h1>
                    <p className="text-gray-600">获取数据时发生错误，请稍后再试</p>
                </div>
            </div>
        );
    }
}