import { NextRequest, NextResponse } from 'next/server';
import { getMessages } from '@/lib/server/db';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        if (!username) {
            return NextResponse.json({ success: false, message: '缺少用户名' }, { status: 400 });
        }

        const result = await getMessages(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { success: false, message: '获取消息失败，请稍后重试' },
            { status: 500 }
        );
    }
} 