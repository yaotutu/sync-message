import { NextResponse, NextRequest } from 'next/server';
import { UserService } from '@/lib/services/userService';
import { JWTService } from '@/lib/auth/jwt';

const userService = UserService.getInstance();
const jwtService = JWTService.getInstance();

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '用户名和密码不能为空' },
                { status: 400 }
            );
        }

        const { user, isValid } = await userService.validateCredentials(username, password);

        if (!isValid || !user) {
            return NextResponse.json(
                { success: false, message: '用户名或密码错误' },
                { status: 401 }
            );
        }

        const token = await jwtService.signToken({
            id: user.id,
            username: user.username,
            role: user.role
        });

        const response = NextResponse.json({
            success: true,
            message: '登录成功',
            data: {
                user
            }
        });

        // 设置 cookie
        response.cookies.set('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 // 1 day
        });

        return response;
    } catch (error) {
        console.error('登录失败:', error);
        return NextResponse.json(
            { success: false, message: '登录失败，请稍后重试' },
            { status: 500 }
        );
    }
} 