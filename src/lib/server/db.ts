import fs from 'fs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const DB_PATH = path.join(process.cwd(), 'data/users.db');

interface RunResult {
    changes: number;
    lastID: number;
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
    await ensureDbExists();
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    `);

    return db;
}

// 验证用户
export async function validateUser(username: string, password: string): Promise<boolean> {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', username, password);
    await db.close();
    return !!user;
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
        const db = await getDb();

        // 检查用户是否已存在
        const existingUser = await db.get('SELECT username FROM users WHERE username = ?', username);
        if (existingUser) {
            await db.close();
            return { success: false, message: '用户名已存在' };
        }

        // 添加新用户
        await db.run('INSERT INTO users (username, password) VALUES (?, ?)', username, password);
        await db.close();
        return { success: true, message: '用户创建成功' };
    } catch (error) {
        console.error('添加用户时发生错误:', error);
        return { success: false, message: '创建用户失败，请稍后重试' };
    }
}

// 更新用户密码
export async function updateUserPassword(username: string, newPassword: string): Promise<void> {
    const db = await getDb();
    const result = await db.run('UPDATE users SET password = ? WHERE username = ?', newPassword, username) as RunResult;
    await db.close();

    if (!result || result.changes === 0) {
        throw new Error('用户不存在');
    }
}

// 获取所有用户
export async function getAllUsers(): Promise<{ username: string }[]> {
    const db = await getDb();
    const users = await db.all('SELECT username FROM users');
    await db.close();
    return users;
}

// 删除用户
export async function deleteUser(username: string): Promise<{ success: boolean; message: string }> {
    try {
        const db = await getDb();
        const result = await db.run('DELETE FROM users WHERE username = ?', username) as RunResult;
        await db.close();

        if (result && result.changes > 0) {
            return { success: true, message: '用户删除成功' };
        } else {
            return { success: false, message: '用户不存在' };
        }
    } catch (error) {
        console.error('删除用户时发生错误:', error);
        return { success: false, message: '删除用户失败，请稍后重试' };
    }
} 