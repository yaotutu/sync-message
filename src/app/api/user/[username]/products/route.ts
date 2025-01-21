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

        // 验证必需字段
        if (!data || typeof data !== 'object') {
            return NextResponse.json({
                success: false,
                message: '无效的请求数据'
            });
        }

        if (!data.title || !data.link) {
            return NextResponse.json({
                success: false,
                message: '商品标题和链接是必需的'
            });
        }

        // 构造产品数据
        const productData = {
            title: data.title.trim(),
            link: data.link.trim(),
            userId: username,
            imageUrl: data.imageUrl?.trim(),
            price: typeof data.price === 'number' ? data.price : undefined,
            description: data.description?.trim(),
            notes: data.notes?.trim()
        };

        const result = await addProduct(productData);
        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '添加产品失败';
        return NextResponse.json({
            success: false,
            message: errorMessage
        });
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

        if (!id) {
            return NextResponse.json({
                success: false,
                message: '产品ID是必需的'
            });
        }

        // 验证必需字段
        if (!data.title || !data.link) {
            return NextResponse.json({
                success: false,
                message: '商品标题和链接是必需的'
            });
        }

        // 构造更新数据
        const updateData = {
            title: data.title,
            link: data.link,
            imageUrl: data.imageUrl || undefined,
            price: data.price || undefined,
            description: data.description || undefined,
            notes: data.notes || undefined
        };

        const result = await updateProduct(id, updateData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新产品失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '更新产品失败'
        });
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

        if (!id) {
            return NextResponse.json({
                success: false,
                message: '产品ID是必需的'
            });
        }

        const result = await deleteProduct(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除产品失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '删除产品失败'
        });
    }
} 