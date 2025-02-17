import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

const authService = AuthService.getInstance();

export async function GET(request: NextRequest) {
    try {
        // 尝试从不同的 cookie 中获取 token
        const userToken = request.cookies.get('user_token')?.value;
        const adminToken = request.cookies.get('admin_token')?.value;
        const token = userToken || adminToken;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: '未登录'
                },
                { status: 401 }
            );
        }

        const verifyResult = await authService.verifySession(token);
        return NextResponse.json(verifyResult);
    } catch (error: any) {
        console.error('验证用户失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '验证失败'
            },
            { status: error.status || 401 }
        );
    }
}