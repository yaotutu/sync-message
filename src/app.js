const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 使用中间件解析 JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 短信webhook路由
app.post('/api/sms-webhook', (req, res) => {
    try {
        const { message, sender, timestamp } = req.body;

        // 在这里处理接收到的短信数据
        console.log('收到新短信：', {
            message,
            sender,
            timestamp
        });

        // 可以在这里添加其他处理逻辑，比如存储到数据库或转发到其他服务

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
    // 获取本机IP地址并显示
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // 跳过内部 IPv6 和回环地址
            if (net.family === 'IPv4' && !net.internal) {
                console.log(`局域网访问地址: http://${net.address}:${port}`);
            }
        }
    }
}); 