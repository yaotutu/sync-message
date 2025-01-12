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
        webhook_key TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS message_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS card_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        first_used_at TEXT,
        expires_in INTEGER
    );

    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
`); 