import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;

        // 获取 user_token
        const token = request.cookies.get('user_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        // 验证 token
        const tokenData = await verifyToken(token);
        if (tokenData.username !== username) {
            return NextResponse.json(
                { success: false, message: '无权访问此用户的资源' },
                { status: 403 }
            );
        }

        // 查找用户
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: '用户不存在' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { count = 1, phones = [], appName = '', linkParams = {} } = body;

        // 生成带链接卡密
        const cardKeys = await Promise.all(
            Array.from({ length: count }, async (_, index) => {
                const key = nanoid(8);
                const phone = phones.length > 0 ? phones[index % phones.length] : undefined;

                return prisma.linkedCardKey.create({
                    data: {
                        key,
                        phone: linkParams.includePhone ? phone : undefined,
                        appName: linkParams.includeAppName ? appName : undefined,
                        user: {
                            connect: {
                                id: user.id
                            }
                        }
                    }
                });
            })
        );

        return NextResponse.json({
            success: true,
            data: cardKeys.map(cardKey => ({
                ...cardKey,
                createdAt: cardKey.createdAt.toISOString(),
                updatedAt: cardKey.updatedAt.toISOString(),
                usedAt: cardKey.usedAt?.toISOString() || null
            }))
        });
    } catch (error) {
        console.error('生成带链接卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '生成带链接卡密失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 