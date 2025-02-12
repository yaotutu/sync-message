import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true, message: '退出成功' });

    // 删除用户token
    response.cookies.delete('user_token');

    return response;
} 