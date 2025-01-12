import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 400 }
            );
        }

        // 验证用户名和密码
        const user = await db.get(
            'SELECT id FROM webhook_users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // 获取用户的消息
        const messages = await db.all(
            `SELECT id, content, type, created_at as createdAt
            FROM messages 
            WHERE username = ?
            ORDER BY created_at DESC`,
            [username]
        );

        return NextResponse.json({
            success: true,
            messages: messages.map(msg => ({
                ...msg,
                createdAt: new Date(msg.createdAt).getTime()
            }))
        });
    } catch (error) {
        console.error('Get user messages error:', error);
        return NextResponse.json(
            { success: false, message: '获取消息失败，请稍后重试' },
            { status: 500 }
        );
    }
} 