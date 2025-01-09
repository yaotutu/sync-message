import express from 'express';
import { getMessagesHandler, webhookHandler } from '../controllers/messageController.js';

const router = express.Router();

// API路由 - 获取所有消息
router.get('/messages', getMessagesHandler);

// Webhook路由 - 处理短信
router.get('/sms-webhook', webhookHandler);
router.post('/sms-webhook', webhookHandler);

export default router;
