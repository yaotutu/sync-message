import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        if (!password) {
            return NextResponse.json(
                { success: false, message: '请提供管理员密码' },
                { status: 400 }
            );
        }

        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: '登录成功'
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { success: false, message: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 