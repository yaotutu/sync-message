import { NextRequest, NextResponse } from 'next/server';
import { validateUser, getUser } from '@/lib/server/db';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '缺少用户名或密码' },
                { status: 400 }
            );
        }

        // 先验证用户
        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json(validateResult, { status: 401 });
        }

        // 获取用户信息
        const result = await getUser(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get webhook user error:', error);
        return NextResponse.json(
            { success: false, message: '获取用户信息失败，请稍后重试' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '缺少用户名或密码' },
                { status: 400 }
            );
        }

        // 验证用户
        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json(validateResult, { status: 401 });
        }

        // 获取用户信息
        const result = await getUser(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get webhook user error:', error);
        return NextResponse.json(
            { success: false, message: '获取用户信息失败，请稍后重试' },
            { status: 500 }
        );
    }
} 