import { updateUserPassword, validateUser } from '@/lib/server/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username, currentPassword, newPassword } = await request.json();

        // 验证参数
        if (!username || !currentPassword || !newPassword) {
            return NextResponse.json(
                { message: '缺少必要参数' },
                { status: 400 }
            );
        }

        // 验证当前用户
        const isValid = await validateUser(username, currentPassword);
        if (!isValid) {
            return NextResponse.json(
                { message: '当前密码验证失败' },
                { status: 401 }
            );
        }

        // 更新密码
        await updateUserPassword(username, newPassword);

        return NextResponse.json(
            { message: '密码更新成功' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('更新密码时发生错误:', error);
        return NextResponse.json(
            { message: '更新密码时发生错误' },
            { status: 500 }
        );
    }
} 