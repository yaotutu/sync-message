import { NextRequest, NextResponse } from 'next/server';
import { cardKeyDb } from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key } = body;

        if (!key) {
            return NextResponse.json(
                { success: false, message: '请提供卡密' },
                { status: 400 }
            );
        }

        const result = await cardKeyDb.validateOnly(key);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { success: false, message: '验证失败' },
            { status: 500 }
        );
    }
} 