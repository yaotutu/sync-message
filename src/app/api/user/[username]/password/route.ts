import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, message: '未登录' });
        }

        // 验证token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (payload.username !== params.username) {
            return NextResponse.json({ success: false, message: '无权限修改' });
        }

        const body = await request.json();
        const { oldPassword, newPassword } = body;

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ success: false, message: '请填写完整信息' });
        }

        // 获取用户信息
        const user = await prisma.user.findUnique({
            where: { username: params.username }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: '用户不存在' });
        }

        // 验证旧密码
        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ success: false, message: '当前密码错误' });
        }

        // 加密新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 更新密码
        await prisma.user.update({
            where: { username: params.username },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('修改密码失败:', error);
        return NextResponse.json({ success: false, message: '修改密码失败' });
    }
} 