import { NextRequest, NextResponse } from 'next/server';
import { getUserMessages } from '@/lib/server/db';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> }
) {
    try {
        const params = await context.params;
        const { userId } = params;

        if (!userId) {
            return NextResponse.json(
                { success: false, message: '用户ID不能为空' },
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