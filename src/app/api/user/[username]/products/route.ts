import { addProduct, deleteProduct, getUserProducts, updateProduct, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户的商品列表
export async function GET(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const result = await getUserProducts(username);
        if (result.success) {
            return NextResponse.json({ success: true, products: result.data });
        } else {
            return NextResponse.json(
                { success: false, message: '获取产品列表失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '获取产品列表失败' },
            { status: 500 }
        );
    }
}

// 添加新商品
export async function POST(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const body = await request.json();
        const result = await addProduct(username, body);
        if (result.success) {
            return NextResponse.json({ success: true, message: '添加产品成功' });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || '添加产品失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '添加产品失败' },
            { status: 500 }
        );
    }
}

// 更新商品
export async function PUT(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        const body = await request.json();
        const result = await updateProduct(username, body);
        if (result.success) {
            return NextResponse.json({ success: true, message: '更新产品成功' });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || '更新产品失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '更新产品失败' },
            { status: 500 }
        );
    }
}

// 删除商品
export async function DELETE(
    request: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const params = await context.params;
        const username = params.username;
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        const storedUsername = request.headers.get('x-username');
        const storedPassword = request.headers.get('x-password');

        if (!storedUsername || !storedPassword) {
            return NextResponse.json({ success: false, message: '未提供认证信息' }, { status: 401 });
        }

        const isValid = await validateUser(storedUsername, storedPassword);
        if (!isValid || storedUsername !== username) {
            return NextResponse.json({ success: false, message: '认证失败' }, { status: 401 });
        }

        if (!id) {
            return NextResponse.json(
                { success: false, message: '未提供产品ID' },
                { status: 400 }
            );
        }

        const result = await deleteProduct(parseInt(id), username);
        if (result.success) {
            return NextResponse.json({ success: true, message: '删除产品成功' });
        } else {
            return NextResponse.json(
                { success: false, message: result.message || '删除产品失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '删除产品失败' },
            { status: 500 }
        );
    }
} 