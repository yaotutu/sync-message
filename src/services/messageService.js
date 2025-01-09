import { config } from '../config/config.js';

// 存储消息的状态
let messages = [];

// 添加新消息
export const addMessage = (messageData) => {
    const { message, sender, timestamp } = messageData;
    const decodedMessage = decodeURIComponent(message);

    const newMessage = {
        message: decodedMessage,
        sender,
        timestamp,
        receivedAt: new Date().toISOString()
    };

    messages = [newMessage, ...messages].slice(0, config.maxMessages);
    return newMessage;
};

// 获取所有消息
export const getAllMessages = () => [...messages];

// 清空消息（用于测试）
export const clearMessages = () => {
    messages = [];
};