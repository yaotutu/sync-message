import { addProduct, deleteProduct, getUserProducts, updateProduct, type ProductInput, type ProductUpdateInput } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

// GET 获取商品列表
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const result = await getUserProducts(params.username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取商品列表失败:', error);
        return NextResponse.json({
            success: false,
            message: '获取商品列表失败',
            data: []
        });
    }
}

// POST 添加商品
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const data = await req.json();

        // 验证必需字段
        if (!data || typeof data !== 'object') {
            return NextResponse.json({
                success: false,
                message: '无效的请求数据'
            });
        }

        if (!data.title?.trim() || !data.link?.trim()) {
            return NextResponse.json({
                success: false,
                message: '商品标题和链接是必需的'
            });
        }

        // 构造商品数据
        const productData: ProductInput = {
            title: data.title.trim(),
            link: data.link.trim(),
            imageUrl: data.imageUrl?.trim() || null,
            price: typeof data.price === 'number' ? data.price : null,
            description: data.description?.trim() || null,
            notes: data.notes?.trim() || null
        };

        const result = await addProduct(params.username, productData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('添加商品失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '添加商品失败'
        });
    }
}

// PUT 更新商品
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const data = await req.json();

        // 验证必需字段
        if (!data || typeof data !== 'object' || !data.id) {
            return NextResponse.json({
                success: false,
                message: '无效的请求数据'
            });
        }

        if (!data.title?.trim() || !data.link?.trim()) {
            return NextResponse.json({
                success: false,
                message: '商品标题和链接是必需的'
            });
        }

        // 构造更新数据
        const updateData: ProductUpdateInput = {
            id: data.id,
            title: data.title.trim(),
            link: data.link.trim(),
            imageUrl: data.imageUrl?.trim() || null,
            price: typeof data.price === 'number' ? data.price : null,
            description: data.description?.trim() || null,
            notes: data.notes?.trim() || null
        };

        const result = await updateProduct(params.username, updateData);
        return NextResponse.json(result);
    } catch (error) {
        console.error('更新商品失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '更新商品失败'
        });
    }
}

// DELETE 删除商品
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ username: string }> }
) {
    try {
        const params = await context.params;
        const data = await req.json();

        if (!data?.id) {
            return NextResponse.json({
                success: false,
                message: '商品ID是必需的'
            });
        }

        const result = await deleteProduct(params.username, data.id);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除商品失败:', error);
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '删除商品失败'
        });
    }
} 