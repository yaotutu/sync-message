import { NextRequest, NextResponse } from 'next/server';
import { TemplateService } from '@/lib/services/templateService';
import { AdminService } from '@/lib/auth/adminService';

const templateService = TemplateService.getInstance();
const adminService = AdminService.getInstance();

// 删除模板
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const result = await templateService.deleteTemplate(
            authResult.data.admin.id,
            params.id
        );

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('删除模板失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '删除模板失败'
            },
            { status: error.status || 500 }
        );
    }
} 