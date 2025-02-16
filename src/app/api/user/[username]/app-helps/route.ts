import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const resolvedParams = await params;
        const { username } = resolvedParams;

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
            data: user.config.appHelps
        });
    } catch (error) {
        console.error('获取应用帮助文档失败:', error);
        return NextResponse.json({ success: false, message: '获取应用帮助文档失败' });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const resolvedParams = await params;
        const { username } = resolvedParams;

        const token = request.cookies.get('user_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: '未登录' });
        }

        try {
            const tokenData = await verifyToken(token);
            if (tokenData.username !== username) {
                return NextResponse.json({ success: false, message: '无权限' });
            }

            const { appName, helpText } = await request.json();

            if (!appName || !helpText) {
                return NextResponse.json({ success: false, message: '应用名称和帮助文档内容不能为空' });
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

            // 检查是否已存在相同应用名称的帮助文档
            const existingAppHelp = await prisma.appHelp.findFirst({
                where: {
                    configId: user.config.id,
                    appName
                }
            });

            if (existingAppHelp) {
                // 更新现有的帮助文档
                const updatedAppHelp = await prisma.appHelp.update({
                    where: {
                        id: existingAppHelp.id
                    },
                    data: {
                        helpText
                    }
                });
                return NextResponse.json({
                    success: true,
                    data: updatedAppHelp
                });
            } else {
                // 创建新的帮助文档
                const newAppHelp = await prisma.appHelp.create({
                    data: {
                        appName,
                        helpText,
                        configId: user.config.id
                    }
                });
                return NextResponse.json({
                    success: true,
                    data: newAppHelp
                });
            }
        } catch (error) {
            console.error('保存应用帮助文档失败:', error);
            return NextResponse.json({ success: false, message: '保存应用帮助文档失败' });
        }
    } catch (error) {
        console.error('保存应用帮助文档失败:', error);
        return NextResponse.json({ success: false, message: '保存应用帮助文档失败' });
    }
} 