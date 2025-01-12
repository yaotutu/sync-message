import { NextRequest, NextResponse } from 'next/server';
import { validateUser, getUserCardKeys, addCardKey } from '@/lib/server/db';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '缺少用户名或密码' },
                { status: 400 }
            );
        }

        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json(validateResult, { status: 401 });
        }

        const result = await getUserCardKeys(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get card keys error:', error);
        return NextResponse.json(
            { success: false, message: '获取卡密列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 401 }
            );
        }

        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json(validateResult, { status: 401 });
        }

        const result = await addCardKey(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Generate card key error:', error);
        return NextResponse.json(
            { success: false, message: '生成卡密失败，请稍后重试' },
            { status: 500 }
        );
    }
} 