import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from './lib/auth/service';
import { AdminService } from './lib/auth/adminService';

const authService = AuthService.getInstance();
const adminService = AdminService.getInstance();

// 需要用户认证的路径
const protectedUserPaths = [
    '/api/user/:username/profile',
    '/api/user/:username/products',
    '/api/user/:username/cardkeys',
    '/api/user/:username/config',
];

// 需要管理员认证的路径
const protectedAdminPaths = [
    '/api/manage/:path*',
    '/manage/dashboard',
    '/manage/users',
    '/manage/products',
    '/manage/settings',
    '/manage/templates',
    '/manage/:path*'  // 捕获所有其他管理后台路径
];

// 公开路径
const publicPaths = [
    '/api/user/login',
    '/api/manage/login',
    '/api/manage/verify',
    '/manage/login',
    '/',
    '/login'  // 添加通用登录路径
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 检查是否是公开路径
    if (publicPaths.some(path => pathname === path || pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 检查是否需要管理员认证
    const isManagePath = pathname.startsWith('/manage/') || pathname.startsWith('/api/manage/');
    if (isManagePath) {
        try {
            const token = request.cookies.get('admin_token')?.value;

            if (!token) {
                // 如果是 API 请求，返回 JSON 响应
                if (pathname.startsWith('/api/')) {
                    return new NextResponse(
                        JSON.stringify({ success: false, message: '未登录' }),
                        { status: 401, headers: { 'content-type': 'application/json' } }
                    );
                }
                // 如果是页面请求，重定向到管理员登录页
                const loginUrl = new URL('/manage/login', request.url);
                return NextResponse.redirect(loginUrl);
            }

            const authResult = await adminService.verifySession(token);

            if (!authResult.success) {
                // 如果是 API 请求，返回 JSON 响应
                if (pathname.startsWith('/api/')) {
                    return new NextResponse(
                        JSON.stringify({ success: false, message: '会话已过期' }),
                        { status: 401, headers: { 'content-type': 'application/json' } }
                    );
                }
                // 如果是页面请求，重定向到管理员登录页
                const loginUrl = new URL('/manage/login', request.url);
                return NextResponse.redirect(loginUrl);
            }

            return NextResponse.next();
        } catch (error) {
            // 如果是 API 请求，返回 JSON 响应
            if (pathname.startsWith('/api/')) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '认证失败' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                );
            }
            // 如果是页面请求，重定向到管理员登录页
            const loginUrl = new URL('/manage/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 检查是否需要用户认证
    const needsUserAuth = protectedUserPaths.some(path =>
        pathname.match(new RegExp(path.replace(':username', '[^/]+'))));

    if (needsUserAuth) {
        try {
            const token = request.cookies.get('user_token')?.value;

            if (!token) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '未登录' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                );
            }

            const authResult = await authService.verifySession(token);

            if (!authResult.success || !authResult.data?.user) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '会话已过期' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                );
            }

            // 检查用户权限
            const urlUsername = pathname.split('/')[3];
            if (urlUsername !== authResult.data.user.username) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '无权访问' }),
                    { status: 403, headers: { 'content-type': 'application/json' } }
                );
            }

            return NextResponse.next();
        } catch (error) {
            return new NextResponse(
                JSON.stringify({ success: false, message: '认证失败' }),
                { status: 401, headers: { 'content-type': 'application/json' } }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * 匹配所有需要用户认证的路径
         */
        '/api/user/:username/profile',
        '/api/user/:username/products',
        '/api/user/:username/cardkeys',
        '/api/user/:username/config',

        /*
         * 匹配所有管理后台路径
         * 注意：/manage/login 已在 publicPaths 中排除
         */
        '/manage/:path*',
        '/api/manage/:path*'
    ]
};