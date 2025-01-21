import { getUserConfig, updateUserConfig, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户配置
export async function GET(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3];

        const result = await getUserConfig(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return NextResponse.json(
            { success: false, message: '获取用户配置失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 更新用户配置
export async function PUT(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3];

        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword || storedUsername !== username) {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const config = await request.json();
        const result = await updateUserConfig(username, config);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return NextResponse.json(
            { success: false, message: '更新用户配置失败，请稍后重试' },
            { status: 500 }
        );
    }
}