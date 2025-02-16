import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

// 获取用户列表
export async function GET(request: NextRequest) {
    const token = request.cookies.get('user_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: '未登录' });
    }

    try {
        const tokenData = await verifyToken(token);
        if (tokenData.username !== 'admin') {
            return NextResponse.json({ success: false, message: '无权限' });
        }

        const users = await prisma.user.findMany({
            select: {
                username: true,
                webhookKey: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return NextResponse.json({ success: false, message: '获取用户列表失败' });
    }
}

// 添加新用户
export async function POST(request: NextRequest) {
    const token = request.cookies.get('user_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: '未登录' });
    }

    try {
        const tokenData = await verifyToken(token);
        if (tokenData.username !== 'admin') {
            return NextResponse.json({ success: false, message: '无权限' });
        }

        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ success: false, message: '用户名和密码不能为空' });
        }

        // 检查用户名是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ success: false, message: '用户名已存在' });
        }

        // 创建新用户
        const hashedPassword = await bcrypt.hash(password, 10);
        const webhookKey = nanoid(32);

        await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                webhookKey,
            },
        });

        return NextResponse.json({ success: true, message: '用户创建成功' });
    } catch (error) {
        console.error('创建用户失败:', error);
        return NextResponse.json({ success: false, message: '创建用户失败' });
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    const token = request.cookies.get('user_token')?.value;
    if (!token) {
        return NextResponse.json({ success: false, message: '未登录' });
    }

    try {
        const tokenData = await verifyToken(token);
        if (tokenData.username !== 'admin') {
            return NextResponse.json({ success: false, message: '无权限' });
        }

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ success: false, message: '用户名不能为空' });
        }

        if (username === 'admin') {
            return NextResponse.json({ success: false, message: '不能删除管理员账号' });
        }

        await prisma.user.delete({
            where: { username },
        });

        return NextResponse.json({ success: true, message: '用户删除成功' });
    } catch (error) {
        console.error('删除用户失败:', error);
        return NextResponse.json({ success: false, message: '删除用户失败' });
    }
} 