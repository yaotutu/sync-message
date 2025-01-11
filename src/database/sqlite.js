import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保数据目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db;

// 生成随机密钥
function generateWebhookKey() {
    return crypto.randomBytes(32).toString('hex');
}

export const initDatabase = async () => {
    try {
        const dbPath = config.database.path;

        // 确保数据目录存在
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // 连接数据库
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 创建必要的表（使用 IF NOT EXISTS 确保表存在）
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
                raw_data TEXT NOT NULL,  -- 原始数据
                sms_content TEXT NOT NULL,  -- 短信正文
                sender TEXT,
                rec_time TEXT,
                received_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
                FOREIGN KEY (username) REFERENCES users(username)
            )
        `);

        console.log('数据库初始化成功');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
    }
};

// 用户认证
export const authDb = {
    // 验证管理员密码
    validateAdmin(password) {
        return password === config.admin.password;
    },

    // 验证普通用户
    async validateUser(username, password) {
        const user = await db.get(
            'SELECT username FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        return !!user;
    },

    // 验证Webhook密钥
    async validateWebhookKey(key) {
        const user = await db.get(
            'SELECT username FROM users WHERE webhook_key = ?',
            [key]
        );
        return user ? { valid: true, username: user.username } : { valid: false };
    },

    // 验证Webhook密钥和用户名
    async validateWebhookKeyAndUser(webhookKey, username) {
        const user = await db.get(
            'SELECT username FROM users WHERE webhook_key = ? AND username = ?',
            [webhookKey, username]
        );
        if (!user) {
            return { valid: false, message: '无效的webhook密钥或用户名不匹配' };
        }
        return { valid: true, username: user.username };
    },

    // 添加用户（仅管理员可用）
    async addUser(adminPassword, username, password) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        try {
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
        } catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return { success: false, message: '用户名已存在' };
            }
            throw error;
        }
    },

    // 删除用户（仅管理员可用）
    async deleteUser(adminPassword, username) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        try {
            const result = await db.run(
                'DELETE FROM users WHERE username = ?',
                [username]
            );
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
    async getUsers(adminPassword) {
        if (!this.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        const users = await db.all('SELECT username, webhook_key, created_at FROM users ORDER BY created_at DESC');
        return { success: true, users };
    }
};

// 卡密相关操作
export const cardKeyDb = {
    // 卡密有效期（毫秒）
    KEY_EXPIRY_TIME: 3 * 60 * 1000, // 3分钟

    async add(username, key) {
        await db.run(
            'INSERT INTO card_keys (key, username) VALUES (?, ?)',
            [key, username]
        );
    },

    // 验证卡密但不删除
    async validateOnly(key) {
        const cardKey = await db.get('SELECT key, username, first_used_at FROM card_keys WHERE key = ?', [key]);
        if (!cardKey) {
            // 记录无效卡密使用（不关联用户）
            await db.run(
                'INSERT INTO key_usage_logs (key, username, status) VALUES (?, ?, ?)',
                [key, 'unknown', 'invalid']
            );
            return { valid: false, message: '无效的卡密' };
        }

        const now = Date.now();

        // 如果是首次使用，记录使用时间
        if (!cardKey.first_used_at) {
            await db.run(
                'UPDATE card_keys SET first_used_at = ? WHERE key = ?',
                [now, key]
            );
            cardKey.first_used_at = now;
        }

        // 检查是否过期
        if (now - cardKey.first_used_at > this.KEY_EXPIRY_TIME) {
            // 删除过期的卡密
            await db.run('DELETE FROM card_keys WHERE key = ?', [key]);
            // 记录过期使用
            await db.run(
                'INSERT INTO key_usage_logs (key, username, status) VALUES (?, ?, ?)',
                [key, cardKey.username, 'expired']
            );
            return { valid: false, message: '卡密已过期' };
        }

        // 记录成功使用
        await db.run(
            'INSERT INTO key_usage_logs (key, username, status) VALUES (?, ?, ?)',
            [key, cardKey.username, 'success']
        );

        // 计算剩余时间（毫秒）
        const remainingTime = this.KEY_EXPIRY_TIME - (now - cardKey.first_used_at);

        return {
            valid: true,
            message: '验证成功',
            username: cardKey.username,
            expiresIn: remainingTime,
            firstUsedAt: cardKey.first_used_at
        };
    },

    // 获取用户的卡密使用记录
    async getUserLogs(username) {
        const logs = await db.all(`
            SELECT key, used_at, status
            FROM key_usage_logs
            WHERE username = ?
            ORDER BY used_at DESC
            LIMIT 100
        `, [username]);
        return { success: true, logs };
    },

    // 获取所有卡密使用记录（仅管理员可用）
    async getUsageLogs(adminPassword) {
        if (!authDb.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

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
    async add(username, content) {
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
                    content,  // 原始数据
                    messageData.sms_content || content,  // 短信正文
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
        } catch (error) {
            // 回滚事务
            await db.run('ROLLBACK');
            throw error;
        }
    },

    // 获取用户的消息
    async getMessages(username) {
        const messages = await db.all(`
            SELECT raw_data as content, sms_content, rec_time, received_at
            FROM messages
            WHERE username = ?
            ORDER BY strftime('%Y-%m-%d %H:%M:%S', rec_time) DESC
            LIMIT 100
        `, [username]);
        return messages;
    },

    // 获取所有消息（仅管理员可用）
    async getAllMessages(adminPassword) {
        if (!authDb.validateAdmin(adminPassword)) {
            return { success: false, message: '管理员密码错误' };
        }

        const messages = await db.all(`
            SELECT username, content, received_at
            FROM messages
            ORDER BY received_at DESC
            LIMIT 100
        `);
        return { success: true, messages };
    }
};
