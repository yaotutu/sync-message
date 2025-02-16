import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ username: string; appName: string }> }
) {
    try {
        const resolvedParams = await params;
        const { username, appName } = resolvedParams;

        const token = request.cookies.get('user_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: '未登录' });
        }

        const tokenData = await verifyToken(token);
        if (tokenData.username !== username) {
            return NextResponse.json({ success: false, message: '无权限' });
        }

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

        const appHelp = await prisma.appHelp.findFirst({
            where: {
                configId: user.config.id,
                appName
            }
        });

        if (!appHelp) {
            return NextResponse.json({ success: false, message: '应用帮助文档不存在' });
        }

        await prisma.appHelp.delete({
            where: {
                id: appHelp.id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('删除应用帮助文档失败:', error);
        return NextResponse.json({ success: false, message: '删除应用帮助文档失败' });
    }
} 