import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookKey, addMessage } from '@/lib/server/db';

interface WebhookBody {
    sms_content: string;
    rec_time?: string;
}

export async function POST(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const webhookKey = request.headers.get('x-webhook-key');

        if (!username || !webhookKey) {
            return NextResponse.json(
                { success: false, message: '缺少必要的请求头' },
                { status: 400 }
            );
        }

        const validateResult = await validateWebhookKey(webhookKey);
        if (!validateResult.success || !validateResult.user) {
            return NextResponse.json(
                { success: false, message: validateResult.message || 'Webhook Key 无效' },
                { status: 401 }
            );
        }

        // 验证用户名是否匹配
        if (validateResult.user.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户名与Webhook Key不匹配' },
                { status: 401 }
            );
        }

        const body = await request.json() as WebhookBody;
        const receivedAt = body.rec_time ? new Date(body.rec_time) : new Date();

        const result = await addMessage(validateResult.user.id, body.sms_content, receivedAt);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { success: false, message: '处理webhook请求失败，请稍后重试' },
            { status: 500 }
        );
    }
}