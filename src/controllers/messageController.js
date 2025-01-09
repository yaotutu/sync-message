import { addMessage, getAllMessages } from '../services/messageService.js';

// 获取所有消息的控制器
export const getMessagesHandler = async (req, res) => {
    try {
        const messages = getAllMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取消息失败'
        });
    }
};

// 处理 webhook 的控制器
export const webhookHandler = async (req, res) => {
    try {
        const messageData = req.method === 'POST' ? req.body : req.query;

        if (!messageData.message || !messageData.sender) {
            return res.status(400).json({
                success: false,
                message: '消息格式不正确'
            });
        }

        const newMessage = addMessage(messageData);
        console.log('收到新短信：', newMessage);

        res.status(200).json({
            success: true,
            message: '短信接收成功'
        });
    } catch (error) {
        console.error('处理短信时出错：', error);
        res.status(500).json({
            success: false,
            message: '处理短信时发生错误'
        });
    }
};
