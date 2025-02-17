import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { key, username } = await request.json();

        if (!key || !username) {
            return NextResponse.json(
                {
                    success: false,
                    message: '缺少必要参数'
                },
                { status: 400 }
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { username }
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

        // 查找卡密
        const cardKey = await prisma.simpleCardKey.findFirst({
            where: {
                key,
                userId: user.id
            }
        });

        if (!cardKey) {
            return NextResponse.json(
                {
                    success: false,
                    message: '卡密不存在'
                },
                { status: 404 }
            );
        }

        if (cardKey.used) {
            // 检查是否在有效期内
            const now = new Date();
            const expireMinutes = 5; // 默认5分钟有效期
            const expireTime = new Date(cardKey.usedAt!.getTime() + expireMinutes * 60 * 1000);

            if (now > expireTime) {
                return NextResponse.json(
                    {
                        success: false,
                        message: '卡密已过期'
                    },
                    { status: 400 }
                );
            }

            return NextResponse.json({
                success: true,
                message: '卡密验证成功',
                data: {
                    expireTime
                }
            });
        }

        // 更新卡密使用状态
        await prisma.simpleCardKey.update({
            where: { id: cardKey.id },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: '卡密验证成功',
            data: {
                expireTime: new Date(Date.now() + 5 * 60 * 1000)
            }
        });
    } catch (error) {
        console.error('验证卡密失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: '验证卡密失败'
            },
            { status: 500 }
        );
    }
} 