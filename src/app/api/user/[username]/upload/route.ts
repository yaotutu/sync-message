import { validateUser } from '@/lib/server/db';
import { mkdir, writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname;
        const username = pathname.split('/')[3]; // 从路径中获取用户名

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

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, message: '未找到上传的文件' },
                { status: 400 }
            );
        }

        // 创建用户目录
        const userDir = path.join(process.cwd(), 'public', 'uploads', username);
        await mkdir(userDir, { recursive: true });

        // 生成文件名
        const timestamp = Date.now();
        const extension = path.extname(file.name);
        const fileName = `${timestamp}${extension}`;
        const filePath = path.join(userDir, fileName);

        // 保存文件
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // 返回文件的相对路径
        const relativePath = `/uploads/${username}/${fileName}`;
        return NextResponse.json({
            success: true,
            message: '文件上传成功',
            data: { url: relativePath }
        });
    } catch (error) {
        console.error('文件上传失败:', error);
        return NextResponse.json(
            { success: false, message: '文件上传失败，请稍后重试' },
            { status: 500 }
        );
    }
} 