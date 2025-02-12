import { addCardKey, deleteCardKey, getUserCardKeys, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// GET 获取用户卡密列表
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const token = request.cookies.get('user_token');
        const params = await context.params;
        const { username } = params;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        );

        if (payload.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const result = await getUserCardKeys(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get card keys error:', error);
        return NextResponse.json(
            { success: false, message: '获取卡密列表失败' },
            { status: 500 }
        );
    }
}

// 生成新卡密
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const token = request.cookies.get('user_token');
        const params = await context.params;
        const { username } = params;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(
            token.value,
            new TextEncoder().encode(process.env.NEXTAUTH_SECRET)
        );

        if (payload.username !== username) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const count = Number(searchParams.get('count')) || 1;

        const result = await addCardKey(username, count);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Generate card keys error:', error);
        return NextResponse.json(
            { success: false, message: '生成卡密失败' },
            { status: 500 }
        );
    }
}

// 删除卡密
export async function DELETE(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const { id } = await req.json();
        const result = await deleteCardKey(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除卡密失败:', error);
        return NextResponse.json({ success: false, message: '删除卡密失败' });
    }
} 