import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/database';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const adminPassword = request.headers.get('x-admin-password');

        if (!adminPassword || adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const { username } = params;
        if (!username) {
            return NextResponse.json(
                { success: false, message: '用户名不能为空' },
                { status: 400 }
            );
        }

        const result = await userDb.deleteUser(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, message: '删除用户失败' },
            { status: 500 }
        );
    }
} 