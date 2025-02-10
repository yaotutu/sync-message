import { validateUser } from '@/lib/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const username = req.headers.get('x-username');
        const password = req.headers.get('x-password');

        if (!username || !password) {
            return NextResponse.json({
                success: false,
                message: '未提供认证信息'
            }, {
                status: 401
            });
        }

        const validationResult = await validateUser(username, password);

        if (!validationResult.success) {
            return NextResponse.json({
                success: false,
                message: validationResult.message
            }, {
                status: 401
            });
        }

        return NextResponse.json({
            success: true,
            message: '验证成功',
            data: {
                username
            }
        });
    } catch (error) {
        console.error('验证用户失败:', error);
        return NextResponse.json({
            success: false,
            message: '验证失败，请稍后重试'
        }, {
            status: 500
        });
    }
}