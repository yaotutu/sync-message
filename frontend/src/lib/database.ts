import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// 类型定义
interface CardKey {
    key: string;
    username: string;
    created_at: number;
    first_used_at: number | null;
}

interface User {
    username: string;
    webhook_key: string;
    created_at: number;
}

interface Message {
    raw_data: string;
    sms_content: string;
    rec_time: string | null;
    received_at: number;
}

interface DbResult {
    changes: number;
    lastID: number;
}

// 配置
const config = {
    admin: {
        password: process.env.ADMIN_PASSWORD || 'admin123'
    },
    messages: {
        maxMessagesPerUser: 100
    }
};

// 数据库配置
const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database | null = null;

// 生成随机密钥
function generateWebhookKey() {
    return crypto.randomBytes(32).toString('hex');
}

// 初始化数据库连接
export async function initDatabase(): Promise<Database> {
    if (db) return db;

    try {
        db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        // 创建必要的表
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                webhook_key TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS card_keys (
                key TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
                first_used_at INTEGER DEFAULT NULL,
                FOREIGN KEY (username) REFERENCES users(username)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS key_usage_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL,
                username TEXT NOT NULL,
                used_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
                status TEXT NOT NULL,
                FOREIGN KEY (username) REFERENCES users(username)
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                raw_data TEXT NOT NULL,
                sms_content TEXT NOT NULL,
                sender TEXT,
                rec_time TEXT,
                received_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY (username) REFERENCES users(username)
            )
        `);

        console.log('数据库初始化成功');
        return db;
    } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
    }
}

// 用户认证
export const authDb = {
    // 验证管理员密码
    validateAdmin(password: string) {
        return password === config.admin.password;
    },

    // 验证普通用户
    async validateUser(username: string, password: string) {
        const db = await initDatabase();
        const user = await db.get(
            'SELECT username FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        return !!user;
    },

    // 验证Webhook密钥
    async validateWebhookKey(key: string) {
        const db = await initDatabase();
        const user = await db.get(
            'SELECT username FROM users WHERE webhook_key = ?',
            [key]
        );
        return user ? { valid: true, username: user.username } : { valid: false };
    },

    // 添加用户（仅管理员可用）
    async addUser(adminPassword: string, username: string, password: string) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        try {
            const db = await initDatabase();
            const webhookKey = generateWebhookKey();
            await db.run(
                'INSERT INTO users (username, password, webhook_key) VALUES (?, ?, ?)',
                [username, password, webhookKey]
            );
            return {
                success: true,
                message: '用户添加成功',
                data: {
                    username,
                    password,
                    webhookKey
                }
            };
        } catch (error: any) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return { success: false, message: '用户名已存在' };
            }
            throw error;
        }
    },

    // 删除用户（仅管理员可用）
    async deleteUser(adminPassword: string, username: string) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        try {
            const db = await initDatabase();
            const result = await db.run(
                'DELETE FROM users WHERE username = ?',
                [username]
            ) as DbResult;

            if (result.changes > 0) {
                // 删除用户相关的卡密和使用记录
                await db.run('DELETE FROM card_keys WHERE username = ?', [username]);
                await db.run('DELETE FROM key_usage_logs WHERE username = ?', [username]);
                return { success: true, message: '用户删除成功' };
            }
            return { success: false, message: '用户不存在' };
        } catch (error) {
            throw error;
        }
    },

    // 获取用户列表（仅管理员可用）
    async getUsers(adminPassword: string) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        const db = await initDatabase();
        const users = await db.all(
            'SELECT username, webhook_key, created_at FROM users ORDER BY created_at DESC'
        );
        return { success: true, users };
    }
};

// 卡密相关操作
export const cardKeyDb = {
    // 添加卡密
    async add(username: string, key: string) {
        const db = await initDatabase();
        await db.run(
            'INSERT INTO card_keys (key, username) VALUES (?, ?)',
            [key, username]
        );
    },

    async validateOnly(key: string) {
        try {
            const db = await initDatabase();
            const cardKey = await db.get(
                'SELECT key, username, first_used_at FROM card_keys WHERE key = ?',
                [key]
            );

            if (!cardKey) {
                // 记录无效卡密使用
                await db.run(
                    'INSERT INTO key_usage_logs (key, username, status) VALUES (?, ?, ?)',
                    [key, 'unknown', 'invalid']
                );
                return { success: false, message: '无效的卡密' };
            }

            const now = Date.now();

            // 如果是首次使用，记录使用时间
            if (!cardKey.first_used_at) {
                await db.run(
                    'UPDATE card_keys SET first_used_at = ? WHERE key = ?',
                    [now, key]
                );
                cardKey.first_used_at = now;
            } else {
                // 检查是否已过期（3分钟）
                const elapsedTime = now - cardKey.first_used_at;
                if (elapsedTime > 3 * 60 * 1000) {
                    return { success: false, message: '卡密已过期', expired: true };
                }
            }

            // 记录成功使用
            await db.run(
                'INSERT INTO key_usage_logs (key, username, status) VALUES (?, ?, ?)',
                [key, cardKey.username, 'success']
            );

            return {
                success: true,
                message: '验证成功',
                username: cardKey.username,
                firstUsedAt: cardKey.first_used_at,
                expiresIn: cardKey.first_used_at ?
                    (3 * 60 * 1000) - (now - cardKey.first_used_at) :
                    3 * 60 * 1000
            };
        } catch (error) {
            console.error('Error validating card key:', error);
            return { success: false, message: '系统错误' };
        }
    },

    // 获取用户的卡密列表
    async getUserCardKeys(username: string, page = 1, pageSize = 10) {
        const db = await initDatabase();

        const totalCount = await db.get<{ count: number }>(
            'SELECT COUNT(*) as count FROM card_keys WHERE username = ?',
            [username]
        );

        const offset = (page - 1) * pageSize;

        const cardKeys = await db.all<CardKey[]>(
            'SELECT key, username, created_at, first_used_at FROM card_keys WHERE username = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [username, pageSize, offset]
        );

        return {
            cardKeys: cardKeys.map(key => ({
                ...key,
                isUsed: !!key.first_used_at
            })),
            pagination: {
                total: totalCount?.count || 0,
                current: page,
                pageSize: pageSize,
                totalPages: Math.ceil((totalCount?.count || 0) / pageSize)
            }
        };
    },

    // 获取使用日志
    async getLogs(adminPassword: string) {
        if (!authDb.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        const db = await initDatabase();
        const logs = await db.all(`
            SELECT key, username, used_at, status
            FROM key_usage_logs
            ORDER BY used_at DESC
            LIMIT 100
        `);
        return { success: true, logs };
    }
};

// 消息相关操作
export const messageDb = {
    // 添加新消息
    async add(username: string, content: string) {
        const db = await initDatabase();
        // 开始事务
        await db.run('BEGIN TRANSACTION');

        try {
            // 解析消息内容
            let messageData;
            try {
                messageData = JSON.parse(content);
            } catch (error) {
                messageData = {
                    sms_content: content,
                    sender: null,
                    rec_time: null
                };
            }

            // 插入新消息
            await db.run(
                'INSERT INTO messages (username, raw_data, sms_content, sender, rec_time) VALUES (?, ?, ?, ?, ?)',
                [
                    username,
                    content,
                    messageData.sms_content || content,
                    messageData.sender || null,
                    messageData.rec_time || null
                ]
            );

            // 获取当前用户的消息数量
            const countResult = await db.get(
                'SELECT COUNT(*) as count FROM messages WHERE username = ?',
                [username]
            );

            // 如果超过配置的最大数量，删除最旧的消息
            if (countResult.count > config.messages.maxMessagesPerUser) {
                await db.run(`
                    DELETE FROM messages
                    WHERE id IN (
                        SELECT id
                        FROM messages
                        WHERE username = ?
                        ORDER BY strftime('%Y-%m-%d %H:%M:%S', rec_time) ASC
                        LIMIT ?
                    )
                `, [username, countResult.count - config.messages.maxMessagesPerUser]);
            }

            // 提交事务
            await db.run('COMMIT');
            return { success: true, message: '消息添加成功' };
        } catch (error) {
            // 回滚事务
            await db.run('ROLLBACK');
            throw error;
        }
    },

    async getMessages(username: string) {
        try {
            const db = await initDatabase();
            const messages = await db.all(`
                SELECT raw_data as content, sms_content, rec_time, received_at
                FROM messages
                WHERE username = ?
                ORDER BY strftime('%Y-%m-%d %H:%M:%S', rec_time) DESC
                LIMIT 100
            `, [username]);
            return { success: true, messages };
        } catch (error) {
            console.error('Error getting messages:', error);
            return { success: false, message: '获取消息失败' };
        }
    },

    // 获取所有消息（仅管理员可用）
    async getAllMessages(adminPassword: string) {
        if (!authDb.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        const db = await initDatabase();
        const messages = await db.all(`
            SELECT username, raw_data as content, received_at
            FROM messages
            ORDER BY received_at DESC
            LIMIT 100
        `);
        return { success: true, messages };
    }
}; 