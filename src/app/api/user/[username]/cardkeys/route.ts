import { addCardKey, deleteCardKey, getUserCardKeys, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取卡密列表
export async function GET(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const headers = request.headers;
        const storedUsername = headers.get('x-username');
        const storedPassword = headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const result = await getUserCardKeys(username);
        if (result.success) {
            return NextResponse.json({ success: true, data: result.data });
        } else {
            return NextResponse.json(
                { success: false, message: '获取卡密列表失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '获取卡密列表失败' },
            { status: 500 }
        );
    }
}

// 生成新卡密
export async function POST(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const headers = request.headers;
        const storedUsername = headers.get('x-username');
        const storedPassword = headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const url = new URL(request.url);
        const count = parseInt(url.searchParams.get('count') || '1');

        if (count < 1 || count > 20) {
            return NextResponse.json(
                { success: false, message: '生成数量必须在 1-20 之间' },
                { status: 400 }
            );
        }

        const cardKeys = [];
        for (let i = 0; i < count; i++) {
            // 生成随机卡密
            const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const result = await addCardKey(username, key);
            if (result.success) {
                cardKeys.push(result.data);
            }
        }

        if (cardKeys.length > 0) {
            return NextResponse.json({
                success: true,
                message: '卡密创建成功',
                data: cardKeys
            });
        } else {
            return NextResponse.json(
                { success: false, message: '创建卡密失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '创建卡密失败' },
            { status: 500 }
        );
    }
}

// 删除卡密
export async function DELETE(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const headers = request.headers;
        const storedUsername = headers.get('x-username');
        const storedPassword = headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { success: false, message: '未提供卡密ID' },
                { status: 400 }
            );
        }

        const result = await deleteCardKey(parseInt(id), username);
        if (result.success) {
            return NextResponse.json({ success: true, message: '卡密删除成功' });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || '删除卡密失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '删除卡密失败' },
            { status: 500 }
        );
    }
} 