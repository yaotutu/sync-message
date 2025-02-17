import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/templateService';
import { AdminService } from '@/lib/auth/adminService';

const templateService = TemplateService.getInstance();
const adminService = AdminService.getInstance();

// 获取模板列表
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const authResult = await adminService.verifySession(token);
        if (!authResult.success || !authResult.data?.admin) {
            return NextResponse.json(
                { success: false, message: '会话已过期' },
                { status: 401 }
            );
        }

        const result = await templateService.listTemplates(authResult.data.admin.id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('获取模板列表失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '获取模板列表失败'
            },
            { status: error.status || 500 }
        );
    }
}

// 创建模板
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const authResult = await adminService.verifySession(token);
        if (!authResult.success || !authResult.data?.admin) {
            return NextResponse.json(
                { success: false, message: '会话已过期' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { appName, helpDoc, rules } = body;

        if (!appName || !helpDoc || !Array.isArray(rules)) {
            return NextResponse.json(
                { success: false, message: '请提供完整的模板信息' },
                { status: 400 }
            );
        }

        const result = await templateService.createTemplate(authResult.data.admin.id, {
            appName,
            helpDoc,
            rules
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('创建模板失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '创建模板失败'
            },
            { status: error.status || 500 }
        );
    }
} 