import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function verifyUserToken(token: string): Promise<{ username: string } | null> {
    try {
        const secret = process.env.NEXTAUTH_SECRET;
        if (!secret) {
            console.error('NEXTAUTH_SECRET is not set in environment variables');
            return null;
        }

        const decoded = jwt.verify(token, secret) as { username: string };
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;

        // 获取 user_token
        const userToken = request.cookies.get('user_token');

        if (!userToken) {
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        // 验证 token
        const decoded = await verifyUserToken(userToken.value);
        if (!decoded?.username) {
            return NextResponse.json(
                { success: false, message: '无效的认证信息' },
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

        // 查找用户的所有带链接卡密
        const cardKeys = await prisma.linkedCardKey.findMany({
            where: {
                user: {
                    username
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

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
        console.error('获取带链接卡密列表失败:', error);
        return NextResponse.json(
            { success: false, message: '获取带链接卡密列表失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 