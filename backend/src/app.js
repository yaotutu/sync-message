import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cardKeyRoutes from './routes/cardKeyRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();

// 添加 CORS 支持
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
app.use('/api/cardkey', cardKeyRoutes);
app.use('/api/message', messageRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 