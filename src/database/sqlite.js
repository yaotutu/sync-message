import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保数据目录存在
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

let db;

export const initDatabase = async () => {
    try {
        const dbPath = config.database.path;
        const dbExists = fs.existsSync(dbPath);

        // 连接数据库
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // 只在数据库文件不存在时创建表
        if (!dbExists) {
            // 创建卡密表
            await db.exec(`
                CREATE TABLE IF NOT EXISTS card_keys (
                    key TEXT PRIMARY KEY
                )
            `);

            console.log('数据库表创建成功');
        }

        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
    }
};

// 卡密相关操作
export const cardKeyDb = {
    async add(key) {
        await db.run('INSERT INTO card_keys (key) VALUES (?)', [key]);
    },

    async validate(key) {
        const cardKey = await db.get('SELECT key FROM card_keys WHERE key = ?', [key]);
        if (!cardKey) {
            return { valid: false, message: '无效的卡密' };
        }
        await db.run('DELETE FROM card_keys WHERE key = ?', [key]);
        return { valid: true, message: '登录成功' };
    }
}; 