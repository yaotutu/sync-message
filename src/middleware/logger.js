import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// 创建请求日志文件流
const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);

// 创建错误日志文件流
const errorLogStream = fs.createWriteStream(
    path.join(logDir, 'error.log'),
    { flags: 'a' }
);

// 请求日志中间件
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const log = `${new Date().toISOString()} ${req.method} ${req.url} ${res.statusCode} ${duration}ms\n`;
        accessLogStream.write(log);
    });
    next();
};

// 错误日志中间件
export const errorLogger = (err, req, res, next) => {
    const errorLog = `${new Date().toISOString()} ERROR: ${err.stack}\n`;
    errorLogStream.write(errorLog);
    console.error(err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
}; 