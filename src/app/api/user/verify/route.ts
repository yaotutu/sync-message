import { validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');

    if (!username || !password) {
        return NextResponse.json(
            { success: false, message: '缺少用户名或密码' },
            { status: 400 }
        );
    }

    const isValid = await validateUser(username, password);

    if (!isValid) {
        return NextResponse.json(
            { success: false, message: '用户名或密码错误' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        data: { username }
    });
} 