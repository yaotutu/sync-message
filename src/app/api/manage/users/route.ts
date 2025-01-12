import { NextRequest, NextResponse } from 'next/server';
import { addUser, deleteUser, getUsers, validateAdminPassword } from '@/lib/server/db';

// 获取用户列表
export async function GET(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
        return NextResponse.json({ success: false, message: '管理员密码错误' }, { status: 401 });
    }

    const result = await getUsers();
    return NextResponse.json(result);
}

// 添加新用户
export async function POST(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
        return NextResponse.json({ success: false, message: '管理员密码错误' }, { status: 401 });
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
        return NextResponse.json({ success: false, message: '用户名和密码不能为空' }, { status: 400 });
    }

    const result = await addUser(username, password);
    return NextResponse.json(result);
}

// 删除用户
export async function DELETE(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    if (!adminPassword || !(await validateAdminPassword(adminPassword))) {
        return NextResponse.json({ success: false, message: '管理员密码错误' }, { status: 401 });
    }

    const username = request.nextUrl.searchParams.get('username');
    if (!username) {
        return NextResponse.json({ success: false, message: '用户名不能为空' }, { status: 400 });
    }

    const result = await deleteUser(username);
    return NextResponse.json(result);
} 