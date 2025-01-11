import express from 'express';
import { generateCardKeys, validateCardKey, getUserCardKeys } from '../controllers/cardKeyController.js';
import { requireAuth } from '../middleware/auth.js';
import { authDb, cardKeyDb } from '../database/sqlite.js';

const router = express.Router();

// 管理员登录验证
router.post('/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                message: '缺少管理员密码'
            });
        }

        const isValid = authDb.validateAdmin(password);
        if (isValid) {
            res.json({
                success: true,
                message: '登录成功'
            });
        } else {
            res.status(401).json({
                success: false,
                message: '管理员密码错误'
            });
        }
    } catch (error) {
        console.error('管理员登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    }
});

// 用户登录
router.post('/user/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '缺少用户名或密码'
            });
        }

        const isValid = await authDb.validateUser(username, password);
        if (isValid) {
            res.json({
                success: true,
                message: '登录成功'
            });
        } else {
            res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }
    } catch (error) {
        console.error('用户登录失败:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    }
});

// 生成卡密（需要认证）
router.get('/generate', requireAuth, generateCardKeys);

// 验证卡密（不需要认证，因为是给用户使用的）
router.post('/validate', validateCardKey);

// 获取用户的卡密列表（需要认证）
router.get('/list', requireAuth, getUserCardKeys);

// 添加用户（需要管理员密码）
router.post('/users', async (req, res) => {
    try {
        const { adminPassword, username, password } = req.body;
        if (!adminPassword || !username || !password) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数'
            });
        }

        const result = await authDb.addUser(adminPassword, username, password);
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('添加用户失败:', error);
        res.status(500).json({
            success: false,
            message: '添加用户失败'
        });
    }
});

// 删除用户（需要管理员密码）
router.delete('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const adminPassword = req.headers['x-admin-password'];

        if (!adminPassword) {
            return res.status(400).json({
                success: false,
                message: '缺少管理员密码'
            });
        }

        const result = await authDb.deleteUser(adminPassword, username);
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('删除用户失败:', error);
        res.status(500).json({
            success: false,
            message: '删除用户失败'
        });
    }
});

// 获取用户列表（需要管理员密码）
router.get('/users', async (req, res) => {
    try {
        const adminPassword = req.headers['x-admin-password'];
        if (!adminPassword) {
            return res.status(400).json({
                success: false,
                message: '缺少管理员密码'
            });
        }

        const result = await authDb.getUsers(adminPassword);
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('获取用户列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取用户列表失败'
        });
    }
});

// 获取卡密使用记录（需要管理员密码）
router.get('/key-logs', async (req, res) => {
    try {
        const adminPassword = req.headers['x-admin-password'];
        if (!adminPassword) {
            return res.status(400).json({
                success: false,
                message: '缺少管理员密码'
            });
        }

        const result = await cardKeyDb.getUsageLogs(adminPassword);
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('获取卡密使用记录失败:', error);
        res.status(500).json({
            success: false,
            message: '获取卡密使用记录失败'
        });
    }
});

export default router; 