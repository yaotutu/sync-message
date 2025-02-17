import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { AdminLoginCredentials, AdminResponse } from '../types/admin';
import { AuthError } from '../types/auth';
import { JWTService } from './jwt';

const prisma = new PrismaClient();
const jwtService = JWTService.getInstance();

export class AdminService {
    private static instance: AdminService;
    private constructor() { }

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    async login(credentials: AdminLoginCredentials): Promise<AdminResponse> {
        const { username, password } = credentials;

        try {
            const admin = await prisma.admin.findUnique({
                where: { username }
            });

            if (!admin) {
                throw this.createError('管理员账号不存在', 404);
            }

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
                    admin: {
                        id: admin.id,
                        username: admin.username
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

    async verifySession(token: string): Promise<AdminResponse> {
        try {
            const payload = await jwtService.verifyToken(token);

            if (payload.role !== 'admin') {
                throw this.createError('需要管理员权限', 403);
            }

            return {
                success: true,
                data: {
                    admin: {
                        id: payload.id,
                        username: payload.username
                    }
                }
            };
        } catch (error) {
            throw this.createError('会话已过期，请重新登录', 401);
        }
    }

    async changePassword(adminId: string, oldPassword: string, newPassword: string): Promise<AdminResponse> {
        try {
            const admin = await prisma.admin.findUnique({
                where: { id: adminId }
            });

            if (!admin) {
                throw this.createError('管理员账号不存在', 404);
            }

            const isValidPassword = await compare(oldPassword, admin.password);
            if (!isValidPassword) {
                throw this.createError('当前密码错误', 401);
            }

            const hashedPassword = await hash(newPassword, 10);
            await prisma.admin.update({
                where: { id: adminId },
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