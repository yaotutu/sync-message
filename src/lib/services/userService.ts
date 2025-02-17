import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { UserCreateInput, UserListResponse, UserResponse } from '../types/user';
import { AuthError } from '../types/auth';

const prisma = new PrismaClient();

// 使用自定义字母表生成 webhook key，只包含字母和数字
const generateWebhookKey = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 32);

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

    private createError(message: string, status: number): AuthError {
        return { message, status };
    }

    private isAuthError(error: any): error is AuthError {
        return 'status' in error && 'message' in error;
    }
} 