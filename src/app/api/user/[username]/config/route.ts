import { getUserConfig, updateUserConfig } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// GET 获取用户配置
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const result = await getUserConfig(params.username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return NextResponse.json({
            success: false,
            message: '获取用户配置失败'
        });
    }
}

// POST 更新用户配置
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const data = await req.json();

        // 验证数据格式
        if (!data || typeof data !== 'object') {
            return NextResponse.json({
                success: false,
                message: '无效的请求数据'
            });
        }

        // 处理配置数据
        const configData = {
            title: data.title,
            theme: data.theme,
            language: data.language,
            cardKeyExpireMinutes: data.cardKeyExpireMinutes ?
                parseInt(data.cardKeyExpireMinutes) : undefined
        };

        const result = await updateUserConfig(params.username, configData);
        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('更新用户配置失败:', errorMessage);
        return NextResponse.json({
            success: false,
            message: '更新用户配置失败'
        });
    }
}