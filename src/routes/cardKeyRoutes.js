import express from 'express';
import { generateCardKeys, validateCardKey } from '../controllers/cardKeyController.js';

const router = express.Router();

// 生成卡密
router.get('/generate', generateCardKeys);

// 验证卡密
router.post('/validate', validateCardKey);

export default router; 