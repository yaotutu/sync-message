import { NextRequest, NextResponse } from 'next/server';
import { messageDb } from '@/lib/database';

// 获取所有消息
export async function GET(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        const result = await messageDb.getAllMessages(adminPassword);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error getting messages:', error);
        return NextResponse.json(
            { success: false, message: '获取消息列表失败' },
            { status: 500 }
        );
    }
} 