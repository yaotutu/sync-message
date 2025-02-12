import { NextRequest, NextResponse } from 'next/server';
import { getUserConfig, updateUserConfig } from '@/lib/server/db';
import { jwtVerify } from 'jose';

// 获取用户配置
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const token = request.cookies.get('user_token');
        const params = await context.params;
        const { username } = params;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        );

        if (payload.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const result = await getUserConfig(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return NextResponse.json(
            { success: false, message: '获取用户配置失败' },
            { status: 500 }
        );
    }
}

// 更新用户配置
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const token = request.cookies.get('user_token');
        const params = await context.params;
        const { username } = params;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        );

        if (payload.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const data = await request.json();
        const result = await updateUserConfig(username, data);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return NextResponse.json(
            { success: false, message: '更新用户配置失败' },
            { status: 500 }
        );
    }
}