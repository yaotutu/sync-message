import crypto from 'crypto';
import { cardKeyDb } from '../database/sqlite.js';
import { authDb } from '../database/sqlite.js';
import { config } from '../config/config.js';

// 生成随机卡密
function generateKey() {
    return crypto.randomBytes(16).toString('hex');
}

// 生成卡密
export const generateCardKeys = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 1;
        const username = req.headers['x-username'];

        if (count < 1 || count > config.cardKey.maxGenerateCount) {
            return res.status(400).json({
                success: false,
                message: `生成数量必须在1-${config.cardKey.maxGenerateCount}之间`
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
                username: result.username,
                expiresIn: result.expiresIn,
                firstUsedAt: result.firstUsedAt
            });
        } else {
            res.status(401).json({
                success: false,
                message: result.message,
                expired: result.expired
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

// 获取用户的卡密列表
export const getUserCardKeys = async (req, res) => {
    try {
        const username = req.headers['x-username'];
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const result = await cardKeyDb.getUserCardKeys(username, page, pageSize);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('获取卡密列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取卡密列表失败'
        });
    }
}; 