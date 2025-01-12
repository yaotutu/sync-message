import { NextRequest, NextResponse } from 'next/server';

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/templates`, {
            headers: {
                'x-admin-password': adminPassword,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { success: false, message: errorData.message || '获取模板列表失败' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword
            },
            body: JSON.stringify({ name, content })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { success: false, message: errorData.message || '添加模板失败' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Add template error:', error);
        return NextResponse.json(
            { success: false, message: '添加模板失败，请稍后重试' },
            { status: 500 }
        );
    }
} 