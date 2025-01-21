export const config = {
    // 消息相关配置
    message: {
        maxMessagesPerUser: 3,  // 每个用户最大保留的消息数量
    },
    // 卡密相关配置
    cardKey: {
        maxUnusedKeys: 100, // 最大未使用卡密数量
        expiresIn: 24 * 60 * 60 * 1000, // 卡密有效期（毫秒）
    },
    upload: {
        maxSize: 5 * 1024 * 1024, // 最大上传文件大小（字节）
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif'], // 允许的文件类型
    },
    // 其他配置项可以在这里添加...
} as const;

export default config; 