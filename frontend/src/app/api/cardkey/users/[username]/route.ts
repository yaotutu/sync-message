import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { username: string } }
) {
    const adminPassword = request.headers.get('x-admin-password');
    const { username } = params;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/users/${username}`,
            {
                method: 'DELETE',
                headers: {
                    'x-admin-password': adminPassword || ''
                }
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '删除用户失败' },
            { status: 500 }
        );
    }
} 