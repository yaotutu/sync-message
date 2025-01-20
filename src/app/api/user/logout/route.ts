import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const response = NextResponse.json({ success: true, message: '已退出登录' });
        response.cookies.delete('session');
        return response;
    } catch (error) {
        console.error('退出登录失败:', error);
        return NextResponse.json({ success: false, message: '退出登录失败' });
    }
} 