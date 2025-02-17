import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';

const userService = UserService.getInstance();

// 获取用户列表
export async function GET() {
    try {
        const result = await userService.listUsers();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('获取用户列表失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '获取用户列表失败'
            },
            { status: error.status || 500 }
        );
    }
}

// 创建新用户
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '请提供用户名和密码' },
                { status: 400 }
            );
        }

        const result = await userService.createUser({ username, password });
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('创建用户失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '创建用户失败'
            },
            { status: error.status || 500 }
        );
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, message: '请提供用户ID' },
                { status: 400 }
            );
        }

        const result = await userService.deleteUser(userId);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('删除用户失败:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || '删除用户失败'
            },
            { status: error.status || 500 }
        );
    }
} 