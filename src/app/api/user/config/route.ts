import { getUserConfig, updateUserConfig, validateUser } from '@/lib/server/db';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json({ success: false, message: '未登录' }, { status: 401 });
        }

        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
        }

        const configResult = await getUserConfig(username, 'products');
        const products = configResult.data ? configResult.data : [];
        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const username = request.headers.get('x-username');
        const password = request.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json({ success: false, message: '未登录' }, { status: 401 });
        }

        const validateResult = await validateUser(username, password);
        if (!validateResult.success) {
            return NextResponse.json({ success: false, message: '用户名或密码错误' }, { status: 401 });
        }

        // 获取现有配置
        const configResult = await getUserConfig(username, 'products');
        let products = configResult.data || [];

        // 如果是删除操作
        if (request.headers.get('Content-Type') === 'application/json') {
            const { id, action } = await request.json();
            if (action === 'delete') {
                products = products.filter((p: any) => p.id !== id);
                const updateResult = await updateUserConfig(username, 'products', products);
                return NextResponse.json(updateResult);
            }
            return NextResponse.json({ success: false, message: '无效的操作' });
        }

        // 处理表单数据
        const formData = await request.formData();
        const image = formData.get('image') as File | null;
        const configStr = formData.get('config') as string;
        const { action, id, ...productData } = JSON.parse(configStr);

        let imageUrl = productData.imageUrl;
        if (image) {
            // 确保用户目录存在
            const userDir = path.join(process.cwd(), 'public', 'uploads', username);
            await createDirIfNotExists(userDir);

            // 生成唯一的文件名
            const fileName = `${Date.now()}-${image.name}`;
            const filePath = path.join(userDir, fileName);

            // 保存文件
            const bytes = await image.arrayBuffer();
            await writeFile(filePath, Buffer.from(bytes));

            // 更新图片URL
            imageUrl = `/uploads/${username}/${fileName}`;
        }

        // 更新或添加商品
        if (action === 'update') {
            products = products.map((p: any) => p.id === id ? { ...productData, id, imageUrl } : p);
        } else {
            const newId = Date.now().toString();
            products.push({ ...productData, id: newId, imageUrl });
        }

        // 更新用户配置
        const updateResult = await updateUserConfig(username, 'products', products);
        return NextResponse.json(updateResult);
    } catch (error) {
        console.error('保存用户配置失败:', error);
        return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
    }
}

async function createDirIfNotExists(dir: string) {
    try {
        await writeFile(dir, '', { flag: 'wx' });
    } catch (error: any) {
        if (error.code === 'EISDIR') {
            // 目录已存在，忽略错误
            return;
        }
        throw error;
    }
} 