import crypto from 'crypto';
import { cardKeyDb } from '../database/sqlite.js';
import { authDb } from '../database/sqlite.js';

// 生成随机卡密
function generateKey() {
    return crypto.randomBytes(16).toString('hex');
}

// 生成卡密
export const generateCardKeys = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const username = req.headers['x-username'];

        if (count < 1 || count > 10) {
            return res.status(400).json({
                success: false,
                message: '生成数量必须在1-10之间'
            });
        }

        const keys = [];
        for (let i = 0; i < count; i++) {
            const key = generateKey();
            await cardKeyDb.add(username, key);
            keys.push(key);
        }

        res.json({
            success: true,
            message: '生成成功',
            keys
        });
    } catch (error) {
        console.error('生成卡密失败:', error);
        res.status(500).json({
            success: false,
            message: '生成卡密失败'
        });
    }
};

// 验证卡密
export const validateCardKey = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({
                success: false,
                message: '缺少卡密'
            });
        }

        const result = await cardKeyDb.validateOnly(key);
        if (result.valid) {
            res.json({
                success: true,
                message: result.message,
                username: result.username
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('验证卡密失败:', error);
        res.status(500).json({
            success: false,
            message: '验证卡密失败'
        });
    }
}; 