import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        // 先查找用户
        const user = await prisma.user.findUnique({
            where: { username: context.params.username }
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: '用户不存在'
                },
                { status: 404 }
            );
        }

        // 获取用户消息
        const messages = await prisma.$queryRaw`
            SELECT id, content, receivedAt 
            FROM messages 
            WHERE userId = ${user.id}
            ORDER BY receivedAt DESC
        `;

        return NextResponse.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('获取消息失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: '获取消息失败'
            },
            { status: 500 }
        );
    }
} 