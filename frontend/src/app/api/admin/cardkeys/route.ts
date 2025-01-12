import { NextRequest, NextResponse } from 'next/server';
import { cardKeyDb } from '@/lib/database';
import crypto from 'crypto';

// 生成卡密
function generateCardKey() {
    return crypto.randomBytes(16).toString('hex');
}

// 获取用户的卡密列表
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '10');

        if (!username) {
            return NextResponse.json(
                { success: false, message: '用户名不能为空' },
                { status: 400 }
            );
        }

        const result = await cardKeyDb.getUserCardKeys(username, page, pageSize);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Error getting card keys:', error);
        return NextResponse.json(
            { success: false, message: '获取卡密列表失败' },
            { status: 500 }
        );
    }
}

// 生成卡密
export async function POST(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { username, count = 1 } = body;

        if (!username) {
            return NextResponse.json(
                { success: false, message: '用户名不能为空' },
                { status: 400 }
            );
        }

        const keys = [];
        for (let i = 0; i < count; i++) {
            const key = generateCardKey();
            await cardKeyDb.add(username, key);
            keys.push(key);
        }

        return NextResponse.json({
            success: true,
            message: '卡密生成成功',
            keys
        });
    } catch (error) {
        console.error('Error generating card keys:', error);
        return NextResponse.json(
            { success: false, message: '生成卡密失败' },
            { status: 500 }
        );
    }
} 