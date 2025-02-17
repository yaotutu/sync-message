import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: '未提供认证令牌'
                },
                { status: 401 }
            );
        }

        const tokenData = await verifyToken(token);

        if (!tokenData) {
            return NextResponse.json(
                {
                    success: false,
                    message: '无效的认证令牌'
                },
                { status: 401 }
            );
        }

        // 验证token中的用户名是否匹配
        if (tokenData.username !== context.params.username) {
            return NextResponse.json(
                {
                    success: false,
                    message: '用户验证失败'
                },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: tokenData.id,
                    username: tokenData.username,
                    role: tokenData.role
                }
            }
        });
    } catch (error) {
        console.error('验证用户失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: '验证失败'
            },
            { status: 401 }
        );
    }
} 