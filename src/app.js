const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 存储最近100条消息的数组
const messages = [];
const MAX_MESSAGES = 100;

// 使用中间件解析 JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 添加静态文件服务
app.use(express.static('public'));

// 首页路由 - 展示消息列表
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// API路由 - 获取所有消息
app.get('/api/messages', (req, res) => {
    res.json(messages);
});

// 处理消息的通用函数
function handleMessage(messageData) {
    const { message, sender, timestamp } = messageData;
    const decodedMessage = decodeURIComponent(message);

    // 创建新消息对象
    const newMessage = {
        message: decodedMessage,
        sender,
        timestamp,
        receivedAt: new Date().toISOString()
    };

    // 将新消息添加到数组开头
    messages.unshift(newMessage);

    // 如果消息数量超过100，删除最老的消息
    if (messages.length > MAX_MESSAGES) {
        messages.pop();
    }

    console.log('收到新短信：', newMessage);
    return newMessage;
}

// GET 请求的 webhook
app.get('/api/sms-webhook', (req, res) => {
    try {
        const messageData = req.query;
        handleMessage(messageData);

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
});

// POST 请求的 webhook
app.post('/api/sms-webhook', (req, res) => {
    try {
        const messageData = req.body;
        handleMessage(messageData);

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
});

app.listen(port, '0.0.0.0', () => {
    console.log(`服务器运行在 http://0.0.0.0:${port}`);
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`局域网访问地址: http://${net.address}:${port}`);
            }
        }
    }
}); 