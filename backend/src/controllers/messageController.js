import { authDb, messageDb, cardKeyDb } from '../database/sqlite.js';

// 获取消息的控制器
export const getMessagesHandler = async (req, res) => {
    try {
        const key = req.headers['x-card-key'];
        if (!key) {
            return res.status(401).json({ success: false, message: '缺少卡密' });
        }

        // 验证卡密并获取用户信息（不删除卡密）
        const result = await cardKeyDb.validateOnly(key);
        if (!result.valid) {
            return res.status(401).json({
                success: false,
                message: result.message,
                expired: result.expired // 添加过期标志
            });
        }

        // 获取用户的消息
        const messages = await messageDb.getMessages(result.username);
        res.json({
            success: true,
            data: messages,
            expiresIn: result.expiresIn // 返回剩余时间给前端
        });
    } catch (error) {
        console.error('获取消息失败：', error);
        res.status(500).json({ success: false, message: '获取消息失败' });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        // 获取webhook密钥和用户名
        const webhookKey = req.headers['x-webhook-key'];
        const username = req.headers['x-username'];

        if (!webhookKey || !username) {
            return res.status(401).json({ error: '缺少webhook密钥或用户名' });
        }

        // 验证webhook密钥和用户名
        const user = await authDb.validateWebhookKeyAndUser(webhookKey, username);
        if (!user.valid) {
            return res.status(401).json({ error: user.message });
        }

        // 获取消息内容
        const message = req.body;
        if (!message) {
            return res.status(400).json({ error: '消息内容不能为空' });
        }

        // 存储消息到数据库
        await messageDb.add(username, JSON.stringify(message));

        // 广播消息给所有连接的客户端
        const clients = req.app.locals.clients || [];
        clients.forEach(client => {
            client.send(JSON.stringify({
                ...message,
                username: username
            }));
        });

        res.json({ message: '消息发送成功' });
    } catch (error) {
        console.error('处理webhook消息时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};
