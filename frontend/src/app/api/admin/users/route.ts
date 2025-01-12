import { NextRequest, NextResponse } from 'next/server';
import { authDb } from '@/lib/database';

// 获取用户列表
export async function GET(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
                { status: 401 }
            );
        }

        const result = await authDb.getUsers(adminPassword);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error getting users:', error);
        return NextResponse.json(
            { success: false, message: '获取用户列表失败' },
            { status: 500 }
        );
    }
}

// 添加用户
export async function POST(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
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

        const result = await authDb.addUser(adminPassword, username, password);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error adding user:', error);
        return NextResponse.json(
            { success: false, message: '添加用户失败' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    try {
        const adminPassword = request.headers.get('x-admin-password');
        if (!adminPassword) {
            return NextResponse.json(
                { success: false, message: '未提供管理员密码' },
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

        const result = await authDb.deleteUser(adminPassword, username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { success: false, message: '删除用户失败' },
            { status: 500 }
        );
    }
} 