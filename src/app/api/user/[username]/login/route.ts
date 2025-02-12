import { NextRequest, NextResponse } from 'next/server';
import { validateUserPassword } from '@/lib/server/db';
import { SignJWT } from 'jose';

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const { password } = await request.json();
        const params = await context.params;
        const { username } = params;

        if (!password) {
            return NextResponse.json(
                { success: false, message: '请提供密码' },
                { status: 400 }
            );
        }

        const isValid = await validateUserPassword(username, password);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: '用户名或密码错误' },
                { status: 401 }
            );
        }

        // 创建用户JWT token
        const token = await new SignJWT({ username })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('24h')
            .sign(new TextEncoder().encode(process.env.NEXTAUTH_SECRET));

        const response = NextResponse.json({
            success: true,
            message: '登录成功'
        });

        // 设置cookie
        response.cookies.set('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;
    } catch (error) {
        console.error('User login error:', error);
        return NextResponse.json(
            { success: false, message: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 