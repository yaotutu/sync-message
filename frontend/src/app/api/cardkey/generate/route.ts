import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const adminPassword = request.headers.get('x-admin-password');
    const searchParams = request.nextUrl.searchParams;
    const count = searchParams.get('count');

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/cardkey/generate?count=${count}`,
            {
                headers: {
                    'x-admin-password': adminPassword || ''
                }
            }
        );

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '生成卡密失败' },
            { status: 500 }
        );
    }
} 