export const config = {
    // 消息相关配置
    message: {
        maxMessagesPerUser: 3,  // 每个用户最大保留的消息数量
    },
    // 卡密相关配置
    cardKey: {
        validityPeriod: 5 * 60 * 1000,  // 卡密有效期（3分钟）
        maxUnusedKeys: 50,  // 最大未使用卡密数量
    },
    // 其他配置项可以在这里添加...
} as const;

export default config; 