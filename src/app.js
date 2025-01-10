import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { networkInterfaces } from 'os';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { config } from './config/config.js';
import messageRoutes from './routes/messageRoutes.js';
import cardKeyRoutes from './routes/cardKeyRoutes.js';
import { requestLogger, errorLogger } from './middleware/logger.js';
import { initDatabase } from './database/sqlite.js';

// ES modules 中 __dirname 的替代方案
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const createApp = () => {
    const app = express();

    // 中间件配置
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(requestLogger);

    // 路由配置
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/login.html'));
    });

    // API 路由
    app.use('/api', messageRoutes);
    app.use('/api/cardkey', cardKeyRoutes);

    // 错误处理中间件
    app.use(errorLogger);

    return app;
};

// 启动服务器
const startServer = async () => {
    try {
        // 初始化数据库
        await initDatabase();

        const app = createApp();
        app.listen(config.port, config.server.host, () => {
            console.log(`服务器运行在 http://${config.server.host}:${config.port}`);

            // 打印局域网访问地址
            const nets = networkInterfaces();
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        console.log(`局域网访问地址: http://${net.address}:${config.port}`);
                    }
                }
            }
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
};

startServer(); 