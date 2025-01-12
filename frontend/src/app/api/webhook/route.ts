import { NextRequest, NextResponse } from 'next/server';
import { cardKeyDb, messageDb } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        // 获取 webhook key 和用户名
        const webhookKey = request.headers.get('x-webhook-key');
        const username = request.headers.get('x-username');

        if (!webhookKey || !username) {
            return NextResponse.json(
                { success: false, message: '缺少 webhook key 或用户名' },
                { status: 401 }
            );
        }

        // 验证 webhook key
        const validationResult = await cardKeyDb.validateOnly(webhookKey);
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, message: validationResult.message },
                { status: 401 }
            );
        }

        // 验证用户名是否匹配
        if (validationResult.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户名与 webhook key 不匹配' },
                { status: 401 }
            );
        }

        // 获取消息内容
        const body = await request.json();
        if (!body || !body.content) {
            return NextResponse.json(
                { success: false, message: '消息内容不能为空' },
                { status: 400 }
            );
        }

        // 存储消息
        const type = body.type || 'text';
        const result = await messageDb.addMessage(username, body.content, type);

        return NextResponse.json({
            success: true,
            message: '消息发送成功',
            id: result.id
        });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, message: '处理消息失败' },
            { status: 500 }
        );
    }
}