import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 不需要认证的路由
const publicPaths = [
    '/api/user/login',
    '/api/user/verify',
    '/api/webhook',  // webhook endpoints
    '/api/user/*/message',  // 通过卡密访问消息的路由
    '/api/user/*/config',   // 用户配置（消息访问需要）
];

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // 检查是否是公开路由
    if (publicPaths.some(path => {
        if (path.includes('*')) {
            // 处理带通配符的路径
            const regex = new RegExp('^' + path.replace('*', '[^/]+') + '$');
            return regex.test(pathname);
        }
        return pathname.startsWith(path);
    })) {
        return NextResponse.next();
    }

    // 检查认证header
    const username = request.headers.get('x-username');
    const password = request.headers.get('x-password');

    if (!username || !password) {
        console.log(`[Auth Middleware] 认证失败: 缺少认证信息 - ${pathname}`);
        return NextResponse.json(
            { success: false, message: '未提供认证信息' },
            { status: 401 }
        );
    }

    // 继续处理请求
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-auth-validated', 'true');  // 标记请求已经过认证中间件

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// 配置仅对API路由生效
export const config = {
    matcher: '/api/:path*',
};