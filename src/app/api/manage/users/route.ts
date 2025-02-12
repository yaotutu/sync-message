import { addUser, deleteUser, getAllUsers } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface AddUserRequest {
    username: string;
    password: string;
}

// 获取用户列表
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const result = await getAllUsers();
        return NextResponse.json(result);
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return NextResponse.json(
            { success: false, message: '获取用户列表失败' },
            { status: 500 }
        );
    }
}

// 添加新用户
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const body = await request.json() as AddUserRequest;
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
        console.error('添加用户失败:', error);
        return NextResponse.json(
            { success: false, message: '添加用户失败' },
            { status: 500 }
        );
    }
}

// 删除用户
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: '未授权访问' },
                { status: 401 }
            );
        }

        const username = request.nextUrl.searchParams.get('username');
        if (!username) {
            return NextResponse.json(
                { success: false, message: '用户名不能为空' },
                { status: 400 }
            );
        }

        const result = await deleteUser(username);
        return NextResponse.json(result);
    } catch (error) {
        console.error('删除用户失败:', error);
        return NextResponse.json(
            { success: false, message: '删除用户失败' },
            { status: 500 }
        );
    }
} 