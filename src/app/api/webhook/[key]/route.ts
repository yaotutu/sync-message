import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    context: { params: { key: string } }
) {
    try {
        console.log('Received webhook request for key:', context.params.key);

        // 验证 webhook key
        const user = await prisma.user.findUnique({
            where: { webhookKey: context.params.key },
            select: {
                id: true,
                username: true
            }
        });

        if (!user) {
            console.log('Invalid webhook key:', context.params.key);
            return NextResponse.json(
                { success: false, message: 'Invalid webhook key' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { content, receivedAt } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, message: '消息内容不能为空' },
                { status: 400 }
            );
        }

        // 添加消息
        const message = await prisma.message.create({
            data: {
                content,
                userId: user.id,
                receivedAt: receivedAt ? new Date(receivedAt) : new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: '消息添加成功',
            data: message
        });
    } catch (error) {
        console.error('处理 webhook 请求失败:', error);
        return NextResponse.json(
            { success: false, message: '处理请求失败' },
            { status: 500 }
        );
    }
} 