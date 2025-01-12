import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 400 }
            );
        }

        // 验证用户名和密码
        const user = await db.get(
            'SELECT webhook_key as webhookKey FROM webhook_users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (!user) {
            return NextResponse.json(
                { success: false, message: '用户名或密码错误' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            webhookKey: user.webhookKey
        });
    } catch (error) {
        console.error('User login error:', error);
        return NextResponse.json(
            { success: false, message: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 