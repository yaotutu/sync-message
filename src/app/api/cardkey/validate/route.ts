import { NextRequest, NextResponse } from 'next/server';
import { validateCardKey } from '@/lib/server/db';

export async function POST(request: NextRequest) {
    try {
        const { key } = await request.json() as { key: string };

        if (!key) {
            return NextResponse.json(
                { success: false, message: '请提供卡密' },
                { status: 400 }
            );
        }

        const result = await validateCardKey(key);
        return NextResponse.json(result);
    } catch (error) {
        console.error('验证卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '验证卡密失败' },
            { status: 500 }
        );
    }
}
