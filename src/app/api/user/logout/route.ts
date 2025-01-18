import { db } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = request.cookies.get('session')?.value;
        if (session) {
            // 清除用户会话
            await db.run(
                'UPDATE webhook_users SET session = NULL WHERE session = ?',
                [session]
            );
        }

        // 清除会话cookie
        const response = NextResponse.json({ success: true });
        response.cookies.delete('session');
        return response;
    } catch (error) {
        console.error('登出失败:', error);
        return NextResponse.json(
            { success: false, message: '登出失败，请稍后重试' },
            { status: 500 }
        );
    }
} 