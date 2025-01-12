import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

interface MessageTemplate {
    id: number;
    name: string;
    content: string;
    createdAt: string;
}

export async function GET(request: NextRequest) {
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

        try {
            const templates = await db.all<MessageTemplate[]>(`
                SELECT id, name, content, created_at as createdAt
                FROM message_templates
                ORDER BY created_at DESC
            `);

            return NextResponse.json({
                success: true,
                templates: templates.map(template => ({
                    ...template,
                    createdAt: new Date(template.createdAt).getTime()
                }))
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Get templates error:', error);
        return NextResponse.json(
            { success: false, message: '获取模板列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
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

        const { name, content } = await request.json();
        if (!name || !content) {
            return NextResponse.json(
                { success: false, message: '请提供模板名称和内容' },
                { status: 400 }
            );
        }

        try {
            // 检查模板名称是否已存在
            const existingTemplate = await db.get('SELECT id FROM message_templates WHERE name = ?', [name]);
            if (existingTemplate) {
                return NextResponse.json(
                    { success: false, message: '模板名称已存在' },
                    { status: 400 }
                );
            }

            // 插入新模板
            const result = await db.run(
                `INSERT INTO message_templates (name, content, created_at) VALUES (?, ?, ?)`,
                [name, content, new Date().toISOString()]
            );

            const newTemplate = await db.get<MessageTemplate>(
                `SELECT id, name, content, created_at as createdAt
                FROM message_templates WHERE id = ?`,
                [result.lastID]
            );

            if (!newTemplate) {
                throw new Error('Failed to retrieve newly created template');
            }

            return NextResponse.json({
                success: true,
                template: {
                    ...newTemplate,
                    createdAt: new Date(newTemplate.createdAt).getTime()
                }
            });
        } catch (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { success: false, message: '数据库操作失败' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Add template error:', error);
        return NextResponse.json(
            { success: false, message: '添加模板失败，请稍后重试' },
            { status: 500 }
        );
    }
} 