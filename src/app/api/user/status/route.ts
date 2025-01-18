import { db } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const session = request.cookies.get('session')?.value;
        if (!session) {
            return NextResponse.json({ loggedIn: false });
        }

        const user = await db.get(
            'SELECT username FROM webhook_users WHERE session = ?',
            [session]
        );

        return NextResponse.json({
            loggedIn: !!user,
            username: user?.username
        });
    } catch (error) {
        console.error('检查用户状态失败:', error);
        return NextResponse.json({ loggedIn: false });
    }
} 