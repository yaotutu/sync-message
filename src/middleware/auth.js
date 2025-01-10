import { authDb } from '../database/sqlite.js';

export const requireAuth = async (req, res, next) => {
    const username = req.headers['x-username'];
    const password = req.headers['x-password'];

    if (!username || !password) {
        return res.status(401).json({
            success: false,
            message: '缺少认证信息'
        });
    }

    try {
        const isValid = await authDb.validateUser(username, password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '认证失败'
            });
        }
        next();
    } catch (error) {
        console.error('认证错误:', error);
        res.status(500).json({
            success: false,
            message: '认证过程发生错误'
        });
    }
};