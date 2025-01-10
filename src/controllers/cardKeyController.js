import crypto from 'crypto';
import { cardKeyDb } from '../database/sqlite.js';

export const generateCardKeys = async (req, res) => {
    try {
        const count = parseInt(req.query.count) || 5; // 默认生成5个卡密
        const keys = [];

        // 生成指定数量的卡密并存储到数据库
        for (let i = 0; i < count; i++) {
            const key = crypto.randomBytes(8).toString('hex');
            await cardKeyDb.add(key);
            keys.push(key);
        }

        console.log('生成的卡密：', keys.join(','));
        res.json({ success: true, keys });
    } catch (error) {
        console.error('生成卡密失败：', error);
        res.status(500).json({ success: false, message: '生成卡密失败' });
    }
};

export const validateCardKey = async (req, res) => {
    try {
        const { key } = req.body;
        if (!key) {
            return res.status(400).json({ success: false, message: '卡密不能为空' });
        }

        const result = await cardKeyDb.validate(key);
        if (result.valid) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(401).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('验证卡密失败：', error);
        res.status(500).json({ success: false, message: '验证卡密失败' });
    }
}; 