import { validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const username = req.headers.get('x-username');
        const password = req.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json({ success: false, message: '未登录' }, { status: 401 });
        }

        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json(validateResult, { status: 401 });
        }

        return NextResponse.json({ success: true, message: '已登录' });
    } catch (error) {
        console.error('检查登录状态失败:', error);
        return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
} 