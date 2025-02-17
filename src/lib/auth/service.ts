import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { TokenPayload, AuthResponse } from '../types/auth';
import { JWTService } from './jwt';

const prisma = new PrismaClient();
const jwtService = JWTService.getInstance();

interface AuthError {
    message: string;
    status: number;
}

export class AuthService {
    private static instance: AuthService;
    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    /**
     * 用户登录
     * @param username 用户名
     * @param password 密码
     * @returns 登录结果
     */
    async login(username: string, password: string): Promise<AuthResponse> {
        try {
            // 先查找普通用户
            const user = await prisma.user.findUnique({
                where: { username }
            });

            // 如果找到了用户
            if (user) {
                const isValidPassword = await compare(password, user.password);
                if (!isValidPassword) {
                    return {
                        success: false,
                        message: '用户名或密码错误'
                    };
                }

                const token = await jwtService.signToken({
                    id: user.id,
                    username: user.username,
                    role: 'user'
                });

                return {
                    success: true,
                    message: '登录成功',
                    data: {
                        token,
                        user: {
                            id: user.id,
                            username: user.username,
                            role: 'user'
                        }
                    }
                };
            }

            // 如果没找到用户，尝试查找管理员
            const admin = await prisma.admin.findUnique({
                where: { username }
            });

            if (admin) {
                const isValidPassword = await compare(password, admin.password);
                if (!isValidPassword) {
                    return {
                        success: false,
                        message: '用户名或密码错误'
                    };
                }

                const token = await jwtService.signToken({
                    id: admin.id,
                    username: admin.username,
                    role: 'admin'
                });

                return {
                    success: true,
                    message: '登录成功',
                    data: {
                        token,
                        user: {
                            id: admin.id,
                            username: admin.username,
                            role: 'admin'
                        }
                    }
                };
            }

            return {
                success: false,
                message: '用户名或密码错误'
            };
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                message: '登录失败，请稍后重试'
            };
        }
    }

    async logout(): Promise<void> {
        // 登出逻辑在客户端处理（清除 cookie）
        return;
    }

    /**
     * 验证会话
     * @param token JWT token
     * @returns 验证结果
     */
    async verifySession(token: string): Promise<AuthResponse> {
        try {
            const payload = await jwtService.verifyToken(token);
            return {
                success: true,
                data: {
                    user: {
                        id: payload.id,
                        username: payload.username,
                        role: payload.role
                    }
                }
            };
        } catch (error) {
            return {
                success: false,
                message: '会话已过期，请重新登录'
            };
        }
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return {
                    success: false,
                    message: '用户不存在'
                };
            }

            const isValidPassword = await compare(oldPassword, user.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    message: '当前密码错误'
                };
            }

            const hashedPassword = await hash(newPassword, 10);
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            return {
                success: true,
                message: '密码修改成功'
            };
        } catch (error) {
            console.error('修改密码失败:', error);
            return {
                success: false,
                message: '修改密码失败，请稍后重试'
            };
        }
    }

    /**
     * 创建统一的错误对象
     */
    private createError(message: string, status: number): AuthError {
        return { message, status };
    }

    /**
     * 判断是否为认证错误
     */
    private isAuthError(error: any): error is AuthError {
        return 'status' in error && 'message' in error;
    }
} 