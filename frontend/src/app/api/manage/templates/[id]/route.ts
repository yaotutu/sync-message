import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const { id } = params;
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/templates/${id}`,
            {
                method: 'DELETE',
                headers: {
                    'x-admin-password': adminPassword,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { success: false, message: errorData.message || '删除模板失败' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Delete template error:', error);
        return NextResponse.json(
            { success: false, message: '删除模板失败，请稍后重试' },
            { status: 500 }
        );
    }
} 