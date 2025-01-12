import { NextRequest, NextResponse } from 'next/server';
import { cardKeyDb, messageDb } from '@/lib/database';

export async function GET(request: NextRequest) {
    try {
        const cardKey = request.headers.get('x-card-key');

        if (!cardKey) {
            return NextResponse.json(
                { success: false, message: '未提供卡密' },
                { status: 400 }
            );
        }

        // 验证卡密
        const validationResult = await cardKeyDb.validateOnly(cardKey);
        if (!validationResult.success) {
            return NextResponse.json(validationResult, { status: 401 });
        }

        // 获取消息
        const result = await messageDb.getMessages(validationResult.username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Message fetch error:', error);
        return NextResponse.json(
            { success: false, message: '获取消息失败' },
            { status: 500 }
        );
    }
} 