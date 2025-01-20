import { getUserConfig, getUserProducts, validateCardKey } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    try {
        const key = req.nextUrl.searchParams.get('key');
        if (!key) {
            return NextResponse.json({ success: false, message: '未提供卡密' });
        }

        const result = await validateCardKey(key);
        if (!result.success) {
            return NextResponse.json(result);
        }

        const [products, config] = await Promise.all([
            getUserProducts(params.username),
            getUserConfig(params.username)
        ]);

        return NextResponse.json({
            success: true,
            data: {
                products: products.data,
                config: config.data
            }
        });
    } catch (error) {
        console.error('获取消息失败:', error);
        return NextResponse.json({ success: false, message: '获取消息失败' });
    }
} 