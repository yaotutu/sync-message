import { addProduct, deleteProduct, getUserProducts, updateProduct, validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户的商品列表
export async function GET(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username;
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

        const result = await getUserProducts(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取商品列表失败:', error);
        return NextResponse.json(
            { success: false, message: '获取商品列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 添加新商品
export async function POST(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username;
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

        const product = await request.json();
        product.username = username;  // 确保使用路径中的用户名
        const result = await addProduct(product);
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加商品失败:', error);
        return NextResponse.json(
            { success: false, message: '添加商品失败，请稍后重试' },
            { status: 400 }
        );
    }
}

// 更新商品
export async function PUT(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username;
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

        const product = await request.json();
        product.username = username;  // 确保使用路径中的用户名
        const result = await updateProduct(product);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新商品失败:', error);
        return NextResponse.json(
            { success: false, message: '更新商品失败，请稍后重试' },
            { status: 400 }
        );
    }
}

// 删除商品
export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username;
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

        const productId = Number(request.nextUrl.searchParams.get('id'));
        if (!productId) {
            return NextResponse.json(
                { success: false, message: '商品ID不能为空' },
                { status: 400 }
            );
        }

        const result = await deleteProduct(productId, username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除商品失败:', error);
        return NextResponse.json(
            { success: false, message: '删除商品失败，请稍后重试' },
            { status: 400 }
        );
    }
} 