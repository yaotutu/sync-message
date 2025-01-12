export const config = {
    port: process.env.PORT || 3000,
    server: {
        host: '0.0.0.0'
    },
    database: {
        path: process.env.DB_PATH || './data/messages.db'
    },
    logging: {
        dir: './logs'
    },
    admin: {
        password: process.env.ADMIN_PASSWORD || 'admin123' // 默认密码仅用于开发环境
    },
    messages: {
        maxMessagesPerUser: process.env.MAX_MESSAGES_PER_USER || 3 // 每个用户最多保存的消息数量
    },
    cardKey: {
        maxGenerateCount: process.env.MAX_GENERATE_COUNT || 100 // 单次生成卡密的最大数量
    }
};
