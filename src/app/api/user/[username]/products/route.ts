import { addProduct, deleteProduct, getUserProducts, updateProduct } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// GET 获取用户产品列表
export async function GET(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const result = await getUserProducts(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户产品失败:', error);
        return NextResponse.json({ success: false, message: '获取用户产品失败' });
    }
}

// POST 添加产品
export async function POST(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const data = await req.json();
        const result = await addProduct({
            ...data,
            userId: username
        });
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加产品失败:', error);
        return NextResponse.json({ success: false, message: '添加产品失败' });
    }
}

// PUT 更新产品
export async function PUT(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const { id, ...data } = await req.json();
        const result = await updateProduct(id, data);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新产品失败:', error);
        return NextResponse.json({ success: false, message: '更新产品失败' });
    }
}

// DELETE 删除产品
export async function DELETE(
    req: NextRequest,
    context: { params: { username: string } }
) {
    try {
        const { username } = await context.params;
        const { id } = await req.json();
        const result = await deleteProduct(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除产品失败:', error);
        return NextResponse.json({ success: false, message: '删除产品失败' });
    }
} 