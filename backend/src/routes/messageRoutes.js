import express from 'express';
import { handleWebhook, getMessagesHandler } from '../controllers/messageController.js';

const router = express.Router();

// Webhook路由 - 接收消息
router.post('/webhook', handleWebhook);

// 获取消息路由 - 需要卡密验证
router.get('/messages', getMessagesHandler);

export default router;
