import { NextRequest, NextResponse } from 'next/server';
import { AdminService } from '@/lib/auth/adminService';

const adminService = AdminService.getInstance();

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const verifyResult = await adminService.verifySession(token);
        return NextResponse.json(verifyResult);
    } catch (error: any) {
        console.error('验证管理员会话失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '验证失败，请重新登录'
            },
            { status: error.status || 401 }
        );
    }
} 