import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/users`, {
            headers: {
                'x-admin-password': adminPassword || ''
            }
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '获取用户列表失败' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    const body = await request.json();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword || ''
            },
            body: JSON.stringify({
                adminPassword: adminPassword,
                ...body
            })
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '添加用户失败' },
            { status: 500 }
        );
    }
} 