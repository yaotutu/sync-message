import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

type CardKeyMetadata = {
    phone?: string;
    appName?: string;
    linkParams: {
        includePhone: boolean;
        includeAppName: boolean;
    };
};

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
        const { count = 1, phone = '', appName = '', linkParams = {} } = body;

        const metadata: CardKeyMetadata = {
            phone: phone || undefined,
            appName: appName || undefined,
            linkParams: {
                includePhone: !!linkParams.includePhone,
                includeAppName: !!linkParams.includeAppName
            }
        };

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
                        },
                        metadata
                    }
                });
            })
        );

        return NextResponse.json({
            success: true,
            cardKeys: cardKeys.map(cardKey => ({
                ...cardKey,
                createdAt: cardKey.createdAt.toISOString(),
                shareUrl: generateShareUrl(username, cardKey.key, metadata)
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

function generateShareUrl(username: string, cardKey: string, metadata: CardKeyMetadata): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const params = new URLSearchParams({
        cardkey: cardKey,
        ...(metadata.linkParams.includePhone && metadata.phone ? { t: metadata.phone } : {}),
        ...(metadata.linkParams.includeAppName && metadata.appName ? { appname: metadata.appName } : {})
    });
    return `${baseUrl}/user/${username}/message?${params.toString()}`;
} 