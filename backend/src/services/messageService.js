import { config } from '../config/config.js';

// 存储消息的状态
let messages = [];

// 添加新消息
export const addMessage = (messageData) => {
    const { message, sender, rec_time } = messageData;
    const decodedMessage = decodeURIComponent(message);


    const newMessage = {
        content: decodedMessage,
        sender,
        rec_time
    };

    messages = [newMessage, ...messages].slice(0, config.maxMessages);
    return newMessage;
};

// 获取所有消息
export const getAllMessages = () => {
    return [...messages].sort((a, b) => b.rec_time - a.rec_time);
};

// 清空消息（用于测试）
export const clearMessages = () => {
    messages = [];
};