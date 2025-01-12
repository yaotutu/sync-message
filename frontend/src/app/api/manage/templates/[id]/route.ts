import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: '无效的模板ID' },
                { status: 400 }
            );
        }

        try {
            // 检查模板是否存在
            const template = await db.get('SELECT id FROM message_templates WHERE id = ?', [id]);
            if (!template) {
                return NextResponse.json(
                    { success: false, message: '模板不存在' },
                    { status: 404 }
                );
            }

            // 删除模板
            await db.run('DELETE FROM message_templates WHERE id = ?', [id]);

            return NextResponse.json({
                success: true,
                message: '模板删除成功'
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Delete template error:', error);
        return NextResponse.json(
            { success: false, message: '删除模板失败，请稍后重试' },
            { status: 500 }
        );
    }
} 