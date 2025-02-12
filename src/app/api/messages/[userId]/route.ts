import { NextRequest, NextResponse } from 'next/server';
import { getUserMessages } from '@/lib/server/db';

export async function GET(
    request: NextRequest,
    context: { params: { userId: string } }
) {
    try {
        const { userId } = context.params;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: '请提供用户ID' },
                { status: 400 }
            );
        }

        const result = await getUserMessages(userId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取消息失败:', error);
        return NextResponse.json(
            { success: false, message: '获取消息失败' },
            { status: 500 }
        );
    }
} 