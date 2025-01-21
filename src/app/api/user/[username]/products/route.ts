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
        console.log('收到的用户名:', username);

        const data = await req.json();
        console.log('收到的请求数据:', data);

        // 验证必需字段
        if (!data.title || !data.link) {
            console.log('缺少必需字段:', { title: data.title, link: data.link });
            return NextResponse.json({
                success: false,
                message: '商品标题和链接是必需的'
            });
        }

        // 构造产品数据
        const productData = {
            title: data.title,
            link: data.link,
            userId: username,
            imageUrl: data.imageUrl || undefined,
            price: typeof data.price === 'number' ? data.price : undefined,
            description: data.description || undefined,
            notes: data.notes || undefined
        };

        console.log('构造的产品数据:', productData);

        const result = await addProduct(productData);
        console.log('添加产品结果:', result);

        return NextResponse.json(result);
    } catch (error) {
        console.error('添加产品失败:', error);
        console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
        return NextResponse.json({
            success: false,
            message: error instanceof Error ? error.message : '添加产品失败'
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