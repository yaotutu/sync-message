import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        if (adminPassword !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const { username } = params;
        if (!username) {
            return NextResponse.json(
                { success: false, message: '请提供用户名' },
                { status: 400 }
            );
        }

        try {
            // 检查用户是否存在
            const user = await db.get('SELECT id FROM webhook_users WHERE username = ?', [username]);
            if (!user) {
                return NextResponse.json(
                    { success: false, message: '用户不存在' },
                    { status: 404 }
                );
            }

            // 删除用户
            await db.run('DELETE FROM webhook_users WHERE username = ?', [username]);

            return NextResponse.json({
                success: true,
                message: '用户删除成功'
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, message: '删除用户失败，请稍后重试' },
            { status: 500 }
        );
    }
} 