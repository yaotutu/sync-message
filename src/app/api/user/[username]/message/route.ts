import { getUserConfig, getUserProducts, validateCardKey } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context: { params: { username: string } }) {
    try {
        // 获取并等待动态路由参数
        const { username } = await context.params;

        // 从查询参数获取卡密
        const key = req.nextUrl.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ success: false, message: '未提供卡密' });
        }

        // 验证卡密
        const validateResult = await validateCardKey(key);
        if (!validateResult.success || !validateResult.data) {
            return NextResponse.json({
                success: false,
                message: validateResult.message,
                expired: validateResult.message === '卡密已过期'
            });
        }

        // 获取用户数据
        const [products, config] = await Promise.all([
            getUserProducts(username),
            getUserConfig(username)
        ]);

        // 如果获取数据失败
        if (!products.success) {
            return NextResponse.json({
                success: false,
                message: '获取商品数据失败'
            });
        }

        // 计算过期时间
        const expiresIn = validateResult.data.expireTime.getTime() - new Date().getTime();

        return NextResponse.json({
            success: true,
            data: {
                products: products.data,
                config: config.data
            },
            expiresIn
        });
    } catch (error) {
        console.error('获取消息失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '获取消息失败'
        });
    }
}