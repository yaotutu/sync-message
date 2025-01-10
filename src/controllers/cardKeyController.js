import cardKeyService from '../services/cardKeyService.js';

class CardKeyController {
    // 生成卡密
    generateCardKeys(req, res) {
        try {
            const count = parseInt(req.query.count) || 5; // 默认生成5个卡密
            const keys = cardKeyService.generateCardKeys(count);
            console.log('生成的卡密：', keys.join(','));
            res.json({ success: true, keys });
        } catch (error) {
            console.error('生成卡密失败：', error);
            res.status(500).json({ success: false, message: '生成卡密失败' });
        }
    }

    // 验证卡密
    validateCardKey(req, res) {
        try {
            const { key } = req.body;
            if (!key) {
                return res.status(400).json({ success: false, message: '卡密不能为空' });
            }

            const result = cardKeyService.validateCardKey(key);
            if (result.valid) {
                res.json({ success: true, message: result.message });
            } else {
                res.status(401).json({ success: false, message: result.message });
            }
        } catch (error) {
            console.error('验证卡密失败：', error);
            res.status(500).json({ success: false, message: '验证卡密失败' });
        }
    }
}

export default new CardKeyController(); 