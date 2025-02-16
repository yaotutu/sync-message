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

// 获取应用帮助文档列表
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;

        const userToken = request.cookies.get('user_token');
        if (!userToken) {
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        const decoded = await verifyUserToken(userToken.value);
        if (!decoded?.username || decoded.username !== username) {
            return NextResponse.json(
                { success: false, message: '无权访问' },
                { status: 403 }
            );
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

        if (!user) {
            return NextResponse.json(
                { success: false, message: '用户不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: user.config?.appHelps || []
        });
    } catch (error) {
        console.error('获取应用帮助文档失败:', error);
        return NextResponse.json(
            { success: false, message: '获取应用帮助文档失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// 创建或更新应用帮助文档
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;

        const userToken = request.cookies.get('user_token');
        if (!userToken) {
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        const decoded = await verifyUserToken(userToken.value);
        if (!decoded?.username || decoded.username !== username) {
            return NextResponse.json(
                { success: false, message: '无权访问' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { appName, helpText } = body;

        if (!appName || !helpText) {
            return NextResponse.json(
                { success: false, message: '应用名称和帮助文档不能为空' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
            include: { config: true }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: '用户不存在' },
                { status: 404 }
            );
        }

        // 确保用户配置存在
        let config = user.config;
        if (!config) {
            config = await prisma.userConfig.create({
                data: {
                    userId: user.id
                }
            });
        }

        // 创建或更新应用帮助文档
        const appHelp = await prisma.appHelp.upsert({
            where: {
                configId_appName: {
                    configId: config.id,
                    appName
                }
            },
            update: {
                helpText
            },
            create: {
                appName,
                helpText,
                configId: config.id
            }
        });

        return NextResponse.json({
            success: true,
            data: appHelp
        });
    } catch (error) {
        console.error('保存应用帮助文档失败:', error);
        return NextResponse.json(
            { success: false, message: '保存应用帮助文档失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// 删除应用帮助文档
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const { username } = params;
        const { searchParams } = new URL(request.url);
        const appName = searchParams.get('appName');

        if (!appName) {
            return NextResponse.json(
                { success: false, message: '应用名称不能为空' },
                { status: 400 }
            );
        }

        const userToken = request.cookies.get('user_token');
        if (!userToken) {
            return NextResponse.json(
                { success: false, message: '未登录或认证已过期' },
                { status: 401 }
            );
        }

        const decoded = await verifyUserToken(userToken.value);
        if (!decoded?.username || decoded.username !== username) {
            return NextResponse.json(
                { success: false, message: '无权访问' },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
            include: { config: true }
        });

        if (!user?.config) {
            return NextResponse.json(
                { success: false, message: '配置不存在' },
                { status: 404 }
            );
        }

        await prisma.appHelp.delete({
            where: {
                configId_appName: {
                    configId: user.config.id,
                    appName
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        console.error('删除应用帮助文档失败:', error);
        return NextResponse.json(
            { success: false, message: '删除应用帮助文档失败' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 