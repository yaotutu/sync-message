import { getUserProducts, validateCardKey } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const url = new URL(request.url);
        const key = url.searchParams.get('key');

        if (!key) {
            return NextResponse.json(
                { success: false, message: '未提供卡密' },
                { status: 400 }
            );
        }

        // 验证卡密
        const validationResult = await validateCardKey(username, key);
        if (!validationResult.success) {
            return NextResponse.json(
                { success: false, message: validationResult.error || '卡密无效' },
                { status: 401 }
            );
        }

        // 获取用户产品列表
        const productsResult = await getUserProducts(username);
        if (!productsResult.success) {
            return NextResponse.json(
                { success: false, message: '获取产品信息失败' },
                { status: 500 }
            );
        }

        // 返回产品信息和卡密信息
        return NextResponse.json({
            success: true,
            products: productsResult.data,
            message: validationResult.message
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '获取信息失败' },
            { status: 500 }
        );
    }
} 