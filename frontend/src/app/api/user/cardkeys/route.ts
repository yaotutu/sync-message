import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface CardKey {
    id: number;
    key: string;
    username: string;
    status: string;
    createdAt: string;
    firstUsedAt: string | null;
    expiresIn: number | null;
}

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 401 }
            );
        }

        try {
            // 验证用户
            const user = await db.get(
                'SELECT id FROM webhook_users WHERE username = ? AND password = ?',
                [username, password]
            );

            if (!user) {
                return NextResponse.json(
                    { success: false, message: '用户名或密码错误' },
                    { status: 401 }
                );
            }

            // 获取用户的卡密列表
            const cardKeys = await db.all<CardKey[]>(`
                SELECT id, key, username, status, created_at as createdAt, 
                       first_used_at as firstUsedAt, expires_in as expiresIn
                FROM card_keys 
                WHERE username = ?
                ORDER BY created_at DESC
            `, [username]);

            return NextResponse.json({
                success: true,
                cardKeys: cardKeys.map(key => ({
                    ...key,
                    createdAt: new Date(key.createdAt).getTime(),
                    firstUsedAt: key.firstUsedAt ? new Date(key.firstUsedAt).getTime() : null
                }))
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
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

        try {
            // 验证用户
            const user = await db.get(
                'SELECT id FROM webhook_users WHERE username = ? AND password = ?',
                [username, password]
            );

            if (!user) {
                return NextResponse.json(
                    { success: false, message: '用户名或密码错误' },
                    { status: 401 }
                );
            }

            // 生成新的卡密
            const key = generateCardKey();

            // 插入新卡密
            await db.run(
                `INSERT INTO card_keys (key, username, status, created_at) VALUES (?, ?, ?, ?)`,
                [key, username, 'unused', new Date().toISOString()]
            );

            return NextResponse.json({
                success: true,
                message: '卡密生成成功',
                key
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Generate card key error:', error);
        return NextResponse.json(
            { success: false, message: '生成卡密失败，请稍后重试' },
            { status: 500 }
        );
    }
}

function generateCardKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segments = 4;
    const segmentLength = 4;
    const parts: string[] = [];

    for (let i = 0; i < segments; i++) {
        let segment = '';
        for (let j = 0; j < segmentLength; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        parts.push(segment);
    }

    return parts.join('-');
} 