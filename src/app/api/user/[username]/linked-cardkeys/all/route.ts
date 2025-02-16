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

export async function DELETE(
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

        // 删除该用户的所有带链接卡密
        await prisma.linkedCardKey.deleteMany({
            where: {
                userId: user.id
            }
        });

        return NextResponse.json({
            success: true,
            message: '已成功删除所有卡密'
        });
    } catch (error) {
        console.error('删除所有卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '删除所有卡密失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 