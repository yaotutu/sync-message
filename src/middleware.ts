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
];

// 公开路径
const publicPaths = [
    '/api/user/login',
    '/api/manage/login',
    '/api/manage/verify',
    '/manage/login',
    '/',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 检查是否是公开路径
    if (publicPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 检查是否需要管理员认证
    const needsAdminAuth = protectedAdminPaths.some(path =>
        pathname.match(new RegExp(path.replace(':path*', '.*'))));

    if (needsAdminAuth) {
        try {
            const token = request.cookies.get('admin_token')?.value;

            if (!token) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '未登录' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                );
            }

            const authResult = await adminService.verifySession(token);

            if (!authResult.success) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: '会话已过期' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
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
        // 用户相关路径
        '/api/user/:username/profile',
        '/api/user/:username/products',
        '/api/user/:username/cardkeys',
        '/api/user/:username/config',
        // 管理员相关路径
        '/api/manage/:path*',
        '/manage/:path*',
    ],
};