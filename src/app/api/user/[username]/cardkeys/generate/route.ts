import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

async function verifyUserToken(token: string): Promise<{ username: string } | null> {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error('NEXTAUTH_SECRET is not set in environment variables');
            return null;
        }

        console.log('Verifying token:', token.substring(0, 10) + '...');
        const decoded = jwt.verify(token, secret) as { username: string };
        console.log('Token decoded successfully:', decoded);
        return decoded;
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error('JWT verification error:', error.message);
        } else {
            console.error('Unexpected error during token verification:', error);
        }
        return null;
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;

        // 获取 user_token
        const userToken = request.cookies.get('user_token');

        if (!userToken) {
            console.log('No user_token found in cookies');
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        // 验证 token
        const decoded = await verifyUserToken(userToken.value);
        if (!decoded?.username) {
            return NextResponse.json(
                {
                    success: false,
                    message: '无效的认证信息',
                    debug: {
                        env: {
                            hasJwtSecret: !!process.env.NEXTAUTH_SECRET,
                            nodeEnv: process.env.NODE_ENV
                        }
                    }
                },
                { status: 401 }
            );
        }

        // 验证用户权限
        if (decoded.username !== username) {
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
        const { count = 1 } = body;

        const cardKeys = await Promise.all(
            Array.from({ length: count }, async () => {
                const key = nanoid(8);
                return prisma.cardKey.create({
                    data: {
                        key,
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
            cardKeys: cardKeys.map(cardKey => ({
                ...cardKey,
                createdAt: cardKey.createdAt.toISOString()
            }))
        });
    } catch (error) {
        console.error('生成卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '生成卡密失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 