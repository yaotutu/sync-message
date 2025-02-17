import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/auth/adminService';

const adminService = AdminService.getInstance();

export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 400 }
            );
        }

        const loginResult = await adminService.login({ username, password });
        const response = NextResponse.json(loginResult);

        if (loginResult.success && loginResult.data?.token) {
            // 设置管理员 token cookie
            response.cookies.set('admin_token', loginResult.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 24 hours
            });
        }

        return response;
    } catch (error: any) {
        console.error('管理员登录失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '登录失败，请稍后重试'
            },
            { status: error.status || 500 }
        );
    }
} 