import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const token = request.cookies.get('user_token');
        const params = await context.params;
        const { username } = params;

        if (!token) {
            return NextResponse.json({ success: false, message: '未登录' });
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        );

        // 验证token中的用户名是否匹配
        if (payload.username !== username) {
            return NextResponse.json({ success: false, message: '用户验证失败' });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verify token error:', error);
        return NextResponse.json({ success: false, message: '验证失败' });
    }
} 