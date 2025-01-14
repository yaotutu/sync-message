import { NextRequest, NextResponse } from 'next/server';
import { validateUser } from '@/lib/server/db';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    const result = await validateUser(username, password);
    return NextResponse.json(result);
} 