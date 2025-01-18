import { validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json({ success: false, message: '未登录' }, { status: 401 });
        }

        const validateResult = await validateUser(username, password);
        return NextResponse.json(validateResult);
    } catch (error) {
        console.error('验证用户失败:', error);
        return NextResponse.json(
            { success: false, message: '验证失败，请稍后重试' },
            { status: 500 }
        );
    }
} 