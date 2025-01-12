import { NextRequest, NextResponse } from 'next/server';
import { validateAdminPassword, getUsers, addUser, deleteUser } from '@/lib/server/db';

// 获取用户列表
export async function GET(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const result = await getUsers();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { success: false, message: '获取用户列表失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 添加用户
export async function POST(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { success: false, message: '用户名和密码不能为空' },
                { status: 400 }
            );
        }

        const result = await addUser(username, password);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Add user error:', error);
        return NextResponse.json(
            { success: false, message: '添加用户失败，请稍后重试' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
            return NextResponse.json(
                { success: false, message: '管理员密码错误' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { success: false, message: '用户名不能为空' },
                { status: 400 }
            );
        }

        const result = await deleteUser(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            { success: false, message: '删除用户失败，请稍后重试' },
            { status: 500 }
        );
    }
} 