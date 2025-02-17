import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: { appName: string } }
) {
    try {
        const template = await prisma.messageTemplate.findFirst({
            where: {
                appName: context.params.appName
            },
            include: {
                rules: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!template) {
            return NextResponse.json({
                success: false,
                message: '模板不存在'
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                template
            }
        });
    } catch (error) {
        console.error('获取模板失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: '获取模板失败'
            },
            { status: 500 }
        );
    }
} 