import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        // 验证用户 token
        const token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: '未授权访问'
                },
                { status: 401 }
            );
        }

        const decoded = await verifyToken(token);
        if (!decoded || decoded.username !== params.username) {
            return NextResponse.json(
                {
                    success: false,
                    message: '无效的 token'
                },
                { status: 401 }
            );
        }

        // 获取用户消息
        const messages = await prisma.message.findMany({
            where: {
                userId: decoded.id
            },
            orderBy: {
                receivedAt: 'desc'
            },
            select: {
                id: true,
                content: true,
                receivedAt: true
            }
        });

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