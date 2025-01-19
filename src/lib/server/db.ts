import type { CardKey, Product, User, UserConfig } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 验证管理员密码
export async function validateAdminPassword(password: string): Promise<boolean> {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        console.error('未设置管理员密码环境变量 ADMIN_PASSWORD');
        return false;
    }
    return password === adminPassword;
}

// 验证用户
export async function validateUser(username: string, password: string): Promise<boolean> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return false;
        }

        return user.password === password;
    } catch (error) {
        console.error('验证用户失败:', error);
        return false;
    }
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string; data?: User }> {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return { success: false, message: '用户名已存在' };
        }

        const user = await prisma.user.create({
            data: {
                username,
                password
            }
        });

        return { success: true, message: '用户创建成功', data: user };
    } catch (error) {
        console.error('创建用户失败:', error);
        return { success: false, message: '创建用户失败' };
    }
}

// 获取所有用户
export async function getAllUsers(): Promise<{ success: boolean; data: User[] }> {
    try {
        const users = await prisma.user.findMany();
        return { success: true, data: users };
    } catch (error) {
        console.error('获取所有用户失败:', error);
        return { success: false, data: [] };
    }
}

// 删除用户
export async function deleteUser(username: string): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.user.delete({
            where: { username }
        });
        return { success: true, message: '用户删除成功' };
    } catch (error) {
        console.error('删除用户时发生错误:', error);
        return { success: false, message: '删除用户失败，请稍后重试' };
    }
}

// 添加商品
export async function addProduct(data: {
    title: string;
    userId: string;
    imageUrl?: string;
    price?: number;
    description?: string;
    notes?: string;
}): Promise<{ success: boolean; message: string; data?: Product }> {
    try {
        const product = await prisma.product.create({
            data: {
                title: data.title,
                userId: data.userId,
                imageUrl: data.imageUrl,
                price: data.price,
                description: data.description,
                notes: data.notes
            }
        });

        return { success: true, message: '产品创建成功', data: product };
    } catch (error) {
        console.error('创建产品失败:', error);
        return { success: false, message: '创建产品失败' };
    }
}

// 获取用户商品
export async function getUserProducts(userId: string): Promise<{ success: boolean; data: Product[] }> {
    try {
        const products = await prisma.product.findMany({
            where: { userId }
        });

        return { success: true, data: products };
    } catch (error) {
        console.error('获取用户产品失败:', error);
        return { success: false, data: [] };
    }
}

// 更新商品
export async function updateProduct(id: string, data: {
    title?: string;
    imageUrl?: string;
    price?: number;
    description?: string;
    notes?: string;
}): Promise<{ success: boolean; message: string; data?: Product }> {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: {
                title: data.title,
                imageUrl: data.imageUrl,
                price: data.price,
                description: data.description,
                notes: data.notes
            }
        });

        return { success: true, message: '产品更新成功', data: product };
    } catch (error) {
        console.error('更新产品失败:', error);
        return { success: false, message: '更新产品失败' };
    }
}

// 删除商品
export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.product.delete({
            where: { id }
        });

        return { success: true, message: '产品删除成功' };
    } catch (error) {
        console.error('删除产品失败:', error);
        return { success: false, message: '删除产品失败' };
    }
}

// 获取用户配置
export async function getUserConfig(userId: string): Promise<{ success: boolean; data?: UserConfig }> {
    try {
        const config = await prisma.userConfig.findUnique({
            where: { userId }
        });

        if (!config) {
            return { success: false };
        }

        return { success: true, data: config };
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return { success: false };
    }
}

// 更新用户配置
export async function updateUserConfig(userId: string, data: {
    theme?: string;
    language?: string;
}): Promise<{ success: boolean; message: string; data?: UserConfig }> {
    try {
        const config = await prisma.userConfig.upsert({
            where: { userId },
            update: data,
            create: {
                userId,
                ...data
            }
        });

        return { success: true, message: '配置更新成功', data: config };
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return { success: false, message: '更新用户配置失败' };
    }
}

// 获取用户卡密
export async function getUserCardKeys(userId: string): Promise<{ success: boolean; data: CardKey[] }> {
    try {
        const cardKeys = await prisma.cardKey.findMany({
            where: { userId }
        });

        return { success: true, data: cardKeys };
    } catch (error) {
        console.error('获取用户卡密失败:', error);
        return { success: false, data: [] };
    }
}

// 添加卡密
export async function addCardKey(userId: string): Promise<{ success: boolean; message: string; data?: CardKey }> {
    try {
        const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const cardKey = await prisma.cardKey.create({
            data: {
                key,
                userId
            }
        });

        return { success: true, message: '卡密创建成功', data: cardKey };
    } catch (error) {
        console.error('创建卡密失败:', error);
        return { success: false, message: '创建卡密失败' };
    }
}

// 删除卡密
export async function deleteCardKey(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await prisma.cardKey.delete({
            where: { id }
        });

        return { success: true, message: '卡密删除成功' };
    } catch (error) {
        console.error('删除卡密失败:', error);
        return { success: false, message: '删除卡密失败' };
    }
}

// 验证卡密
export async function validateCardKey(key: string): Promise<{ success: boolean; message: string; data?: CardKey }> {
    try {
        const cardKey = await prisma.cardKey.findUnique({
            where: { key }
        });

        if (!cardKey) {
            return { success: false, message: '卡密不存在' };
        }

        if (cardKey.status !== 'unused') {
            return { success: false, message: '卡密已使用或已过期' };
        }

        const updatedCardKey = await prisma.cardKey.update({
            where: { key },
            data: {
                status: 'used',
                usedAt: new Date()
            }
        });

        return { success: true, message: '卡密验证成功', data: updatedCardKey };
    } catch (error) {
        console.error('验证卡密失败:', error);
        return { success: false, message: '验证卡密失败' };
    }
} 
} 
} 
} 