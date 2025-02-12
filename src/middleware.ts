import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 不需要认证的路由
const publicPaths = [
    '/api/user/login',
    '/api/user/verify',
    '/api/webhook',  // webhook endpoints
    '/api/user/*/login',    // 用户登录
    '/api/user/*/verify',   // 用户验证
    '/api/user/*/logout',   // 用户退出
    '/api/user/*/message',  // 通过卡密访问消息的路由
    '/api/user/*/config',   // 用户配置（消息访问需要）
    '/api/user/*/products', // 商品信息接口
];

// 需要认证的API路由
const protectedApiPaths = [
    '/api/user/*/cardkeys',
    '/api/user/*/profile',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 添加安全相关的 HTTP 头
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );

    // 检查是否是公开路由
    if (publicPaths.some(path => {
        if (path.includes('*')) {
            const regex = new RegExp('^' + path.replace('*', '[^/]+') + '$');
            return regex.test(pathname);
        }
        return pathname.startsWith(path);
    })) {
        return response;
    }

    // 检查是否是需要认证的API路由
    const isProtectedApi = protectedApiPaths.some(path => {
        if (path.includes('*')) {
            const regex = new RegExp('^' + path.replace('*', '[^/]+') + '$');
            return regex.test(pathname);
        }
        return pathname.startsWith(path);
    });

    if (isProtectedApi) {
        const token = request.cookies.get('user_token');
        if (!token) {
            return NextResponse.json(
                { success: false, message: '未登录' },
                { status: 401 }
            );
        }
    }

    return response;
}

// 配置中间件匹配的路由
export const config = {
    matcher: [
        '/api/user/:path*',
        '/api/webhook/:path*',
        '/manage/:path*',
        '/user/:path*/cardkeys',
        '/user/:path*/profile',
        '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
    ],
};