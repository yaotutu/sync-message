import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { UserCreateInput, UserListResponse, UserResponse } from '../types/user';
import { AuthError } from '../types/auth';
import { prisma } from '../prisma';

const generateWebhookKey = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);

export interface UserData {
    id: string;
    username: string;
    role: 'user' | 'admin';
}

export class UserService {
    private static instance: UserService;
    private constructor() { }

    public static getInstance(): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }

    async createUser(input: UserCreateInput): Promise<UserResponse> {
        try {
            // 检查用户名是否已存在
            const existingUser = await prisma.user.findUnique({
                where: { username: input.username }
            });

            if (existingUser) {
                throw this.createError('用户名已存在', 400);
            }

            // 加密密码
            const hashedPassword = await hash(input.password, 10);

            // 生成 webhook key
            const webhookKey = generateWebhookKey();

            // 创建用户
            const user = await prisma.user.create({
                data: {
                    username: input.username,
                    password: hashedPassword,
                    webhookKey,
                }
            });

            return {
                success: true,
                message: '用户创建成功',
                data: {
                    user: {
                        id: user.id,
                        username: user.username,
                        webhookKey: user.webhookKey,
                        createdAt: user.createdAt
                    }
                }
            };
        } catch (error) {
            if (this.isAuthError(error)) {
                throw error;
            }
            throw this.createError('创建用户失败，请稍后重试', 500);
        }
    }

    async listUsers(): Promise<UserListResponse> {
        try {
            const users = await prisma.user.findMany({
                orderBy: { createdAt: 'desc' }
            });

            return {
                success: true,
                data: {
                    users: users.map(user => ({
                        id: user.id,
                        username: user.username,
                        webhookKey: user.webhookKey,
                        createdAt: user.createdAt
                    }))
                }
            };
        } catch (error) {
            throw this.createError('获取用户列表失败，请稍后重试', 500);
        }
    }

    async deleteUser(userId: string): Promise<UserResponse> {
        try {
            await prisma.user.delete({
                where: { id: userId }
            });

            return {
                success: true,
                message: '用户删除成功'
            };
        } catch (error) {
            throw this.createError('删除用户失败，请稍后重试', 500);
        }
    }

    /**
     * 验证用户凭据
     */
    async validateCredentials(username: string, password: string): Promise<{ user: UserData | null; isValid: boolean }> {
        // 先查找普通用户
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (user) {
            const isValid = await compare(password, user.password);
            if (isValid) {
                return {
                    isValid: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: 'user'
                    }
                };
            }
        }

        // 如果没找到用户或密码错误，尝试查找管理员
        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (admin) {
            const isValid = await compare(password, admin.password);
            if (isValid) {
                return {
                    isValid: true,
                    user: {
                        id: admin.id,
                        username: admin.username,
                        role: 'admin'
                    }
                };
            }
        }

        return {
            isValid: false,
            user: null
        };
    }

    /**
     * 根据用户名查找用户
     */
    async findByUsername(username: string): Promise<UserData | null> {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (user) {
            return {
                id: user.id,
                username: user.username,
                role: 'user'
            };
        }

        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        if (admin) {
            return {
                id: admin.id,
                username: admin.username,
                role: 'admin'
            };
        }

        return null;
    }

    /**
     * 修改用户密码
     */
    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user) {
            const isValid = await compare(oldPassword, user.password);
            if (!isValid) {
                return false;
            }

            await prisma.user.update({
                where: { id: userId },
                data: { password: newPassword }
            });

            return true;
        }

        return false;
    }

    private createError(message: string, status: number): AuthError {
        return { message, status };
    }

    private isAuthError(error: any): error is AuthError {
        return 'status' in error && 'message' in error;
    }
} 