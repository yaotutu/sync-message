import express from 'express';
import cardKeyController from '../controllers/cardKeyController.js';

const router = express.Router();

// 生成卡密
router.get('/generate', cardKeyController.generateCardKeys);

// 验证卡密
router.post('/validate', cardKeyController.validateCardKey);

export default router; 