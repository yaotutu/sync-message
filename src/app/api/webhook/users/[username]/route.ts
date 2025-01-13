import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    context: { params: { username: string } }
) {
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');
    const { username: targetUsername } = context.params;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/users/${targetUsername}`,
            {
                method: 'DELETE',
                headers: {
                    'x-username': username || '',
                    'x-password': password || ''
                }
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (_error) {
        return NextResponse.json(
            { success: false, message: '删除用户失败' },
            { status: 500 }
        );
    }
} 