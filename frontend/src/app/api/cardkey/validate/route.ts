import { NextRequest, NextResponse } from 'next/server';
import { validateCardKey } from '@/lib/server/db';

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json();
        if (!key) {
            return NextResponse.json(
                { success: false, message: '请提供卡密' },
                { status: 400 }
            );
        }

        const result = await validateCardKey(key);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Validate cardkey error:', error);
        return NextResponse.json(
            { success: false, message: '验证卡密失败，请稍后重试' },
            { status: 500 }
        );
    }
} 