export const config = {
    port: process.env.PORT || 3000,
    maxMessages: parseInt(process.env.MAX_MESSAGES) || 100,
    server: {
        host: '0.0.0.0'
    },
    database: {
        path: process.env.DB_PATH || './data/messages.db'
    },
    logging: {
        dir: './logs'
    }
}; 