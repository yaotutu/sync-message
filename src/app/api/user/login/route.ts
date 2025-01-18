import { validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请输入用户名和密码' },
                { status: 400 }
            );
        }

        const validateResult = await validateUser(username, password);
        return NextResponse.json(validateResult);
    } catch (error) {
        console.error('登录失败:', error);
        return NextResponse.json(
            { success: false, message: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 