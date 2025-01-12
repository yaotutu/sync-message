import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');
    const { id } = params;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/webhook/templates/${id}`,
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
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '删除模板失败' },
            { status: 500 }
        );
    }
} 