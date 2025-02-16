import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET 获取用户配置
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> | { username: string } }
) {
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username;

    if (!username) {
        return NextResponse.json({ success: false, message: '无效的用户名' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                config: {
                    include: {
                        appHelps: true
                    }
                }
            }
        });

        if (!user || !user.config) {
            return NextResponse.json({ success: false, message: '用户配置不存在' });
        }

        return NextResponse.json({
            success: true,
            data: user.config
        });
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return NextResponse.json({ success: false, message: '获取用户配置失败' });
    }
}

// POST 更新用户配置
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> | { username: string } }
) {
    const resolvedParams = await Promise.resolve(params);
    const username = resolvedParams.username;

    if (!username) {
        return NextResponse.json({ success: false, message: '无效的用户名' });
    }

    const token = request.cookies.get('user_token')?.value;

    if (!token) {
        return NextResponse.json({ success: false, message: '未登录' });
    }

    try {
        const tokenData = await verifyToken(token);
        if (tokenData.username !== username) {
            return NextResponse.json({ success: false, message: '无权限' });
        }

        const data = await request.json();
        const { title, cardKeyExpireMinutes } = data;

        const user = await prisma.user.findUnique({
            where: { username },
            include: { config: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: '用户不存在' });
        }

        const updatedConfig = await prisma.userConfig.upsert({
            where: { userId: user.id },
            update: {
                title,
                cardKeyExpireMinutes: cardKeyExpireMinutes ? parseInt(cardKeyExpireMinutes) : null
            },
            create: {
                userId: user.id,
                title,
                cardKeyExpireMinutes: cardKeyExpireMinutes ? parseInt(cardKeyExpireMinutes) : null
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedConfig
        });
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return NextResponse.json({ success: false, message: '更新用户配置失败' });
    }
}