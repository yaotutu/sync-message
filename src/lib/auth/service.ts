import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { AuthError, AuthResponse, LoginCredentials } from '../types/auth';
import { JWTService } from './jwt';

const prisma = new PrismaClient();
const jwtService = JWTService.getInstance();

export class AuthService {
    private static instance: AuthService;
    private constructor() { }

    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { username, password } = credentials;

        try {
            // 先尝试管理员登录
            const admin = await prisma.admin.findUnique({
                where: { username }
            });

            if (admin) {
                const isValidPassword = await compare(password, admin.password);
                if (!isValidPassword) {
                    throw this.createError('密码错误', 401);
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

            // 尝试普通用户登录
            const user = await prisma.user.findUnique({
                where: { username }
            });

            if (!user) {
                throw this.createError('用户不存在', 404);
            }

            const isValidPassword = await compare(password, user.password);
            if (!isValidPassword) {
                throw this.createError('密码错误', 401);
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
        } catch (error) {
            if (this.isAuthError(error)) {
                throw error;
            }
            throw this.createError('登录失败，请稍后重试', 500);
        }
    }

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
            throw this.createError('会话已过期，请重新登录', 401);
        }
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                throw this.createError('用户不存在', 404);
            }

            const isValidPassword = await compare(oldPassword, user.password);
            if (!isValidPassword) {
                throw this.createError('当前密码错误', 401);
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
            if (this.isAuthError(error)) {
                throw error;
            }
            throw this.createError('修改密码失败，请稍后重试', 500);
        }
    }

    private createError(message: string, status: number): AuthError {
        return { message, status };
    }

    private isAuthError(error: any): error is AuthError {
        return 'status' in error && 'message' in error;
    }
} 