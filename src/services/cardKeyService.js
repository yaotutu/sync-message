import crypto from 'crypto';

// 存储卡密信息的Map
const cardKeys = new Map();

class CardKeyService {
    // 生成指定数量的卡密
    generateCardKeys(count) {
        const keys = [];
        for (let i = 0; i < count; i++) {
            const key = crypto.randomBytes(8).toString('hex');
            cardKeys.set(key, {
                usageCount: 0,
                lastLoginTime: null,
                isValid: true
            });
            keys.push(key);
        }
        return keys;
    }

    // 验证卡密
    validateCardKey(key) {
        const cardInfo = cardKeys.get(key);
        if (!cardInfo || !cardInfo.isValid) {
            return { valid: false, message: '无效的卡密' };
        }

        if (cardInfo.usageCount >= 2) {
            return { valid: false, message: '卡密使用次数已达上限' };
        }

        const currentTime = Date.now();
        if (cardInfo.lastLoginTime && (currentTime - cardInfo.lastLoginTime) < 600000) {
            return { valid: true, message: '登录成功' };
        }

        // 更新使用信息
        cardInfo.usageCount += 1;
        cardInfo.lastLoginTime = currentTime;
        cardKeys.set(key, cardInfo);

        return { valid: true, message: '登录成功' };
    }

    // 获取卡密使用情况
    getCardKeyInfo(key) {
        return cardKeys.get(key);
    }
}

export default new CardKeyService(); 