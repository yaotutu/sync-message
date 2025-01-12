import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// 初始化数据库连接
export const db = await open({
    filename: process.env.DATABASE_PATH || './data.db',
    driver: sqlite3.Database
});

// 创建必要的表
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
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (username) REFERENCES webhook_users(username)
    );
`);

// 创建数据库操作函数
export const cardKeyDb = {
    validateOnly: async (key: string) => {
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
            throw error;
        }
    }
};

export const messageDb = {
    getMessages: async (username: string) => {
        try {
            const messages = await db.all(
                `SELECT id, content, type, created_at as createdAt
                FROM messages 
                WHERE username = ?
                ORDER BY created_at DESC`,
                [username]
            );

            return { success: true, messages };
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    },

    addMessage: async (username: string, content: string, type: string = 'text') => {
        try {
            const result = await db.run(
                'INSERT INTO messages (username, content, type, created_at) VALUES (?, ?, ?, ?)',
                [username, content, type, Date.now()]
            );
            return { success: true, id: result.lastID };
        } catch (error) {
            console.error('Add message error:', error);
            throw error;
        }
    }
}; 