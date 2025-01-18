import fs from 'fs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const DB_PATH = path.join(process.cwd(), 'data/users.db');

interface RunResult {
    changes: number;
    lastID: number;
}

interface User {
    username: string;
    createdAt?: number;
}

// 确保数据目录存在
async function ensureDbExists() {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

// 获取数据库连接
async function getDb() {
    try {
        await ensureDbExists();
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                created_at INTEGER DEFAULT (unixepoch())
            )
        `);

        return db;
    } catch (error) {
        console.error('数据库连接错误:', error);
        throw error;
    }
}

// 验证管理员密码
export async function validateAdminPassword(password: string): Promise<boolean> {
    // 从环境变量获取管理员密码
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
        console.error('未设置管理员密码环境变量 ADMIN_PASSWORD');
        return false;
    }

    return password === adminPassword;
}

// 验证用户
export async function validateUser(username: string, password: string): Promise<boolean> {
    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password);
        await db.close();
        return !!user;
    } catch (error) {
        console.error('验证用户时发生错误:', error);
        return false;
    }
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    let db;
    try {
        db = await getDb();
        console.log('正在检查用户是否存在:', username);

        // 检查用户是否已存在
        const existingUser = await db.get('SELECT username FROM users WHERE username = ?', username);
        if (existingUser) {
            console.log('用户已存在:', username);
            return { success: false, message: '用户名已存在' };
        }

        console.log('开始添加新用户:', username);
        // 添加新用户
        const timestamp = Math.floor(Date.now() / 1000);
        const result = await db.run(
            'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
            [username, password, timestamp]
        ) as RunResult;

        console.log('添加用户结果:', result);
        return { success: true, message: '用户创建成功' };
    } catch (error) {
        console.error('添加用户时发生错误:', error);
        return { success: false, message: '创建用户失败，请稍后重试' };
    } finally {
        if (db) {
            await db.close();
        }
    }
}

// 更新用户密码
export async function updateUserPassword(username: string, newPassword: string): Promise<void> {
    const db = await getDb();
    try {
        const result = await db.run('UPDATE users SET password = ? WHERE username = ?', newPassword, username) as RunResult;

        if (!result || result.changes === 0) {
            throw new Error('用户不存在');
        }
    } finally {
        await db.close();
    }
}

// 获取所有用户
export async function getAllUsers(): Promise<{ success: boolean; data: User[] }> {
    let db;
    try {
        db = await getDb();
        console.log('正在获取用户列表');
        const users = await db.all('SELECT username, created_at as createdAt FROM users ORDER BY created_at DESC');
        console.log('获取到的用户列表:', users);
        return {
            success: true,
            data: users
        };
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return {
            success: false,
            data: []
        };
    } finally {
        if (db) {
            await db.close();
        }
    }
}

// 删除用户
export async function deleteUser(username: string): Promise<{ success: boolean; message: string }> {
    let db;
    try {
        db = await getDb();
        const result = await db.run('DELETE FROM users WHERE username = ?', username) as RunResult;

        if (result && result.changes > 0) {
            return { success: true, message: '用户删除成功' };
        } else {
            return { success: false, message: '用户不存在' };
        }
    } catch (error) {
        console.error('删除用户时发生错误:', error);
        return { success: false, message: '删除用户失败，请稍后重试' };
    } finally {
        if (db) {
            await db.close();
        }
    }
} 