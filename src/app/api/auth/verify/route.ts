import { NextResponse, NextRequest } from 'next/server';
import { JWTService } from '@/lib/auth/jwt';

const jwtService = JWTService.getInstance();

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('user_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }

        const payload = await jwtService.verifyToken(token);
        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: payload.id,
                    username: payload.username,
                    role: payload.role
                }
            }
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: '会话已过期，请重新登录' },
            { status: 401 }
        );
    }
} 