import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/templates`, {
            headers: {
                'x-username': username || '',
                'x-password': password || ''
            }
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '获取模板列表失败' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');
    const body = await request.json();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/templates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-username': username || '',
                'x-password': password || ''
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '添加模板失败' },
            { status: 500 }
        );
    }
} 