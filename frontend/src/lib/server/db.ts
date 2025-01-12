'use server';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// 确保数据库目录存在
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'data.db');

// 初始化数据库连接
const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
});

// 创建表
await db.exec(`
    CREATE TABLE IF NOT EXISTS webhook_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        webhook_key TEXT UNIQUE NOT NULL,
        created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        sms_content TEXT NOT NULL,
        rec_time TEXT,
        received_at INTEGER NOT NULL,
        FOREIGN KEY (username) REFERENCES webhook_users(username)
    );

    CREATE TABLE IF NOT EXISTS card_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unused',
        created_at INTEGER NOT NULL,
        first_used_at INTEGER,
        FOREIGN KEY (username) REFERENCES webhook_users(username)
    );
`);

// 生成Webhook密钥
function generateWebhookKey() {
    return crypto.randomBytes(32).toString('hex');
}

// 生成卡密
function generateCardKey() {
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

// 验证管理员密码
export async function validateAdminPassword(password: string) {
    return password === process.env.ADMIN_PASSWORD;
}

// 用户相关操作
// 添加用户
export async function addUser(username: string, password: string) {
    try {
        const webhook_key = generateWebhookKey();
        const result = await db.run(
            'INSERT INTO webhook_users (username, password, webhook_key, created_at) VALUES (?, ?, ?, ?)',
            [username, password, webhook_key, Date.now()]
        );

        if (!result.lastID) {
            return { success: false, message: '创建用户失败' };
        }

        const user = await db.get(
            'SELECT id, username, webhook_key as webhookKey, created_at as createdAt FROM webhook_users WHERE id = ?',
            [result.lastID]
        );

        if (!user) {
            return { success: false, message: '创建用户成功但获取用户信息失败' };
        }

        return { success: true, data: user };
    } catch (error: any) {
        console.error('Add user error:', error);
        if (error.code === 'SQLITE_CONSTRAINT') {
            return { success: false, message: '用户名已存在' };
        }
        return { success: false, message: '创建用户失败，请稍后重试' };
    }
}

// 删除用户
export async function deleteUser(username: string) {
    try {
        // 先检查用户是否存在
        const user = await db.get('SELECT id FROM webhook_users WHERE username = ?', [username]);
        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        // 开始事务
        await db.run('BEGIN TRANSACTION');

        try {
            // 删除用户的卡密
            await db.run('DELETE FROM card_keys WHERE username = ?', [username]);

            // 删除用户的消息
            await db.run('DELETE FROM messages WHERE username = ?', [username]);

            // 删除用户
            const result = await db.run('DELETE FROM webhook_users WHERE username = ?', [username]);
            const changes = (result as any).changes || 0;

            // 提交事务
            await db.run('COMMIT');

            return {
                success: true,
                data: {
                    username,
                    deleted: changes > 0
                }
            };
        } catch (error) {
            // 回滚事务
            await db.run('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, message: '删除用户失败，请稍后重试' };
    }
}

// 获取用户列表
export async function getUsers() {
    try {
        const users = await db.all(
            `SELECT 
                id, 
                username, 
                webhook_key as webhookKey, 
                created_at as createdAt 
            FROM webhook_users 
            ORDER BY created_at DESC`
        );
        return { success: true, data: users };
    } catch (error) {
        console.error('Get users error:', error);
        return { success: false, message: '获取用户列表失败，请稍后重试' };
    }
}

// 验证用户
export async function validateUser(username: string, password: string) {
    try {
        const user = await db.get(
            `SELECT 
                id, 
                username, 
                webhook_key as webhookKey 
            FROM webhook_users 
            WHERE username = ? AND password = ?`,
            [username, password]
        );

        if (!user) {
            return { success: false, message: '用户名或密码错误' };
        }

        return { success: true, data: user };
    } catch (error) {
        console.error('Validate user error:', error);
        return { success: false, message: '验证用户失败，请稍后重试' };
    }
}

// 消息相关操作
// 获取消息列表
export async function getMessages(username: string) {
    try {
        const messages = await db.all(
            `SELECT id, username, sms_content, rec_time, received_at
            FROM messages 
            WHERE username = ?
            ORDER BY received_at DESC`,
            [username]
        );

        return { success: true, data: messages };
    } catch (error) {
        console.error('Get messages error:', error);
        return { success: false, message: '获取消息列表失败，请稍后重试' };
    }
}

// 添加消息
export async function addMessage(username: string, sms_content: string, rec_time: string | null = null, received_at: number = Date.now()) {
    try {
        // 开始事务
        await db.run('BEGIN TRANSACTION');

        try {
            // 插入新消息
            const result = await db.run(
                'INSERT INTO messages (username, sms_content, rec_time, received_at) VALUES (?, ?, ?, ?)',
                [username, sms_content, rec_time, received_at]
            );

            // 获取当前用户的消息数量
            const countResult = await db.get(
                'SELECT COUNT(*) as count FROM messages WHERE username = ?',
                [username]
            );

            // 如果超过100条消息，删除最旧的消息
            if (countResult.count > 100) {
                await db.run(`
                    DELETE FROM messages
                    WHERE id IN (
                        SELECT id
                        FROM messages
                        WHERE username = ?
                        ORDER BY received_at ASC
                        LIMIT ?
                    )
                `, [username, countResult.count - 100]);
            }

            // 提交事务
            await db.run('COMMIT');

            return { success: true, id: result.lastID };
        } catch (error) {
            // 回滚事务
            await db.run('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error('Add message error:', error);
        return { success: false, message: '添加消息失败，请稍后重试' };
    }
}

// Webhook相关操作
// 验证Webhook密钥
export async function validateWebhookKey(key: string) {
    try {
        const user = await db.get(
            'SELECT username FROM webhook_users WHERE webhook_key = ?',
            [key]
        );

        if (!user) {
            return { success: false, message: '无效的 webhook key' };
        }

        return { success: true, username: user.username };
    } catch (error) {
        console.error('Validate webhook key error:', error);
        return { success: false, message: '验证webhook密钥失败，请稍后重试' };
    }
}

// 卡密相关操作
// 添加卡密
export async function addCardKey(username: string) {
    try {
        const key = generateCardKey();
        const result = await db.run(
            'INSERT INTO card_keys (key, username, created_at) VALUES (?, ?, ?)',
            [key, username, Date.now()]
        );

        if (!result.lastID) {
            return { success: false, message: '生成卡密失败' };
        }

        return { success: true, data: { key } };
    } catch (error) {
        console.error('Add card key error:', error);
        return { success: false, message: '生成卡密失败，请稍后重试' };
    }
}

// 获取用户的卡密列表
export async function getUserCardKeys(username: string) {
    try {
        const cardKeys = await db.all(
            `SELECT 
                id, 
                key, 
                status,
                created_at as createdAt,
                first_used_at as firstUsedAt
            FROM card_keys 
            WHERE username = ?
            ORDER BY created_at DESC`,
            [username]
        );

        return { success: true, data: cardKeys };
    } catch (error) {
        console.error('Get user card keys error:', error);
        return { success: false, message: '获取卡密列表失败，请稍后重试' };
    }
}

// 验证卡密
export async function validateCardKey(key: string) {
    try {
        const cardKey = await db.get(
            `SELECT 
                card_keys.id,
                card_keys.key,
                card_keys.username,
                card_keys.status,
                card_keys.created_at as createdAt,
                card_keys.first_used_at as firstUsedAt,
                webhook_users.webhook_key as webhookKey
            FROM card_keys 
            LEFT JOIN webhook_users ON card_keys.username = webhook_users.username
            WHERE card_keys.key = ?`,
            [key]
        );

        if (!cardKey) {
            return { success: false, message: '无效的卡密' };
        }

        if (cardKey.status === 'used') {
            return { success: false, message: '卡密已使用' };
        }

        // 更新卡密状态
        await db.run(
            'UPDATE card_keys SET status = ?, first_used_at = ? WHERE id = ?',
            ['used', Date.now(), cardKey.id]
        );

        return {
            success: true,
            data: {
                username: cardKey.username,
                webhookKey: cardKey.webhookKey,
                cardKey: cardKey.key,
                createdAt: cardKey.createdAt,
                firstUsedAt: cardKey.firstUsedAt
            }
        };
    } catch (error) {
        console.error('Validate card key error:', error);
        return { success: false, message: '验证卡密失败，请稍后重试' };
    }
}

// 获取单个用户信息
export async function getUser(username: string) {
    try {
        const user = await db.get(
            `SELECT 
                id, 
                username, 
                webhook_key as webhookKey, 
                created_at as createdAt 
            FROM webhook_users 
            WHERE username = ?`,
            [username]
        );

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        return { success: true, data: user };
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, message: '获取用户信息失败，请稍后重试' };
    }
} 