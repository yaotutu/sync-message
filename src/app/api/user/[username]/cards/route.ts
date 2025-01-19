import { addCardKey, deleteCardKey, getUserCardKeys, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取卡密列表
export async function GET(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3];

        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword || storedUsername !== username) {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const result = await getUserCardKeys(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取卡密列表失败:', error);
        return NextResponse.json(
            { success: false, message: '获取卡密列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 添加卡密
export async function POST(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3];

        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword || storedUsername !== username) {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const { key, message } = await request.json();
        if (!key || !message) {
            return NextResponse.json(
                { success: false, message: '卡密和消息内容不能为空' },
                { status: 400 }
            );
        }

        const result = await addCardKey(username, key, message);
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '添加卡密失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 删除卡密
export async function DELETE(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3];

        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword || storedUsername !== username) {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid) {
            return NextResponse.json(
                { success: false, message: '用户验证失败' },
                { status: 401 }
            );
        }

        const id = Number(request.nextUrl.searchParams.get('id'));
        if (!id) {
            return NextResponse.json(
                { success: false, message: '卡密ID不能为空' },
                { status: 400 }
            );
        }

        const result = await deleteCardKey(id, username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除卡密失败:', error);
        return NextResponse.json(
            { success: false, message: '删除卡密失败，请稍后重试' },
            { status: 500 }
        );
    }
} 