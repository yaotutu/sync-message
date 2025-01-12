import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface WebhookUser {
    id: number;
    username: string;
    password: string;
    webhookKey: string;
    createdAt: string;
}

export async function GET(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        try {
            const users = await db.all<WebhookUser[]>(`
                SELECT id, username, password, webhook_key as webhookKey, created_at as createdAt
                FROM webhook_users
                ORDER BY created_at DESC
            `);

            return NextResponse.json({
                success: true,
                users: users.map(user => ({
                    ...user,
                    createdAt: new Date(user.createdAt).getTime()
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
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, message: '获取用户列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const { username, password } = await request.json();
        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 400 }
            );
        }

        try {
            // 检查用户名是否已存在
            const existingUser = await db.get('SELECT id FROM webhook_users WHERE username = ?', [username]);
            if (existingUser) {
                return NextResponse.json(
                    { success: false, message: '用户名已存在' },
                    { status: 400 }
                );
            }

            // 生成 webhook key
            const webhookKey = generateWebhookKey();

            // 插入新用户
            const result = await db.run(
                `INSERT INTO webhook_users (username, password, webhook_key, created_at) VALUES (?, ?, ?, ?)`,
                [username, password, webhookKey, new Date().toISOString()]
            );

            const newUser = await db.get<WebhookUser>(
                `SELECT id, username, password, webhook_key as webhookKey, created_at as createdAt
                FROM webhook_users WHERE id = ?`,
                [result.lastID]
            );

            if (!newUser) {
                throw new Error('Failed to retrieve newly created user');
            }

            return NextResponse.json({
                success: true,
                user: {
                    ...newUser,
                    createdAt: new Date(newUser.createdAt).getTime()
                }
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Add user error:', error);
        return NextResponse.json(
            { success: false, message: '添加用户失败，请稍后重试' },
            { status: 500 }
        );
    }
}

function generateWebhookKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
} 