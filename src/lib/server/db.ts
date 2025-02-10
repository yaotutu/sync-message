import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export const db = prismaClient;

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
export async function validateUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });
        if (!user || user.password !== password) {
            return { success: false, message: '用户名或密码错误' };
        }
        return { success: true, message: '验证成功' };
    } catch (error) {
        console.error('验证用户失败:', error);
        return { success: false, message: '验证失败' };
    }
}

// 获取用户卡密
export async function getUserCardKeys(username: string): Promise<{ success: boolean; data: any[] }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            include: { cardKeys: true }
        });

        if (!user) {
            return { success: false, data: [] };
        }

        // 计算每个卡密的状态
        const now = new Date();
        const cardKeys = user.cardKeys.map(key => {
            let status = '未使用';
            let remainingTime = null;

            if (key.used && key.usedAt) {
                const expireTime = new Date(key.usedAt.getTime() + 3 * 60 * 1000);
                if (now > expireTime) {
                    status = '已过期';
                } else {
                    status = '使用中';
                    remainingTime = Math.floor((expireTime.getTime() - now.getTime()) / 1000);
                }
            }

            return {
                ...key,
                status,
                remainingTime
            };
        });

        return { success: true, data: cardKeys };
    } catch (error) {
        console.error('获取用户卡密列表失败:', error);
        return { success: false, data: [] };
    }
}

// 生成卡密
function generateCardKey(): string {
    return Math.random().toString(36).substring(2, 15);
}

// 添加卡密
export async function addCardKey(username: string, count: number = 1): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const cardKeys = await prismaClient.$transaction(
            Array(count).fill(0).map(() =>
                prismaClient.cardKey.create({
                    data: {
                        key: generateCardKey(),
                        userId: user.id,
                        used: false
                    }
                })
            )
        );

        return {
            success: true,
            message: `成功创建 ${count} 个卡密`,
            data: cardKeys
        };
    } catch (error) {
        console.error('创建卡密失败:', error);
        return { success: false, message: '创建卡密失败' };
    }
}

// 删除卡密
export async function deleteCardKey(id: string): Promise<{ success: boolean; message: string }> {
    try {
        await prismaClient.cardKey.delete({
            where: { id }
        });
        return { success: true, message: '卡密删除成功' };
    } catch (error) {
        console.error('删除卡密失败:', error);
        return { success: false, message: '删除卡密失败' };
    }
}

// 验证卡密
export async function validateCardKey(key: string): Promise<{
    success: boolean;
    message: string;
    data?: {
        usedAt: Date;
        expireTime: Date;
    };
}> {
    try {
        const cardKey = await prismaClient.cardKey.findUnique({
            where: { key }
        });

        if (!cardKey) {
            return { success: false, message: '卡密不存在' };
        }

        const now = new Date();

        if (cardKey.used) {
            if (cardKey.usedAt) {
                const expireTime = new Date(cardKey.usedAt.getTime() + 3 * 60 * 1000);
                if (now > expireTime) {
                    return { success: false, message: '卡密已过期' };
                }
                return {
                    success: true,
                    message: '卡密验证成功',
                    data: {
                        usedAt: cardKey.usedAt,
                        expireTime
                    }
                };
            }
            return { success: false, message: '卡密已使用但未记录使用时间' };
        }

        const updatedCardKey = await prismaClient.cardKey.update({
            where: { id: cardKey.id },
            data: {
                used: true,
                usedAt: now
            }
        });

        const expireTime = new Date(now.getTime() + 3 * 60 * 1000);
        return {
            success: true,
            message: '卡密验证成功',
            data: {
                usedAt: updatedCardKey.usedAt!,
                expireTime
            }
        };
    } catch (error) {
        console.error('验证卡密失败:', error);
        return { success: false, message: '验证卡密失败' };
    }
}

// 获取用户配置
interface UserConfigData {
    theme?: string;
    language?: string;
}

export async function getUserConfig(username: string): Promise<{ success: boolean; data?: any }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            include: { config: true }
        });

        if (!user) {
            return { success: false };
        }

        return { success: true, data: user.config };
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return { success: false };
    }
}

// 更新用户配置
export async function updateUserConfig(
    username: string,
    data: UserConfigData | string,
    value?: any
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        let updateData: any;
        if (typeof data === 'string') {
            updateData = { [data]: value };
        } else {
            updateData = data;
        }

        await prismaClient.userConfig.upsert({
            where: { userId: user.id },
            update: updateData,
            create: {
                userId: user.id,
                ...updateData
            }
        });

        return { success: true, message: '用户配置更新成功' };
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return { success: false, message: '更新用户配置失败' };
    }
}

// 获取用户商品
export async function getUserProducts(username: string): Promise<{ success: boolean; data: any[] }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            include: { products: true }
        });

        if (!user) {
            return { success: false, data: [] };
        }

        return { success: true, data: user.products };
    } catch (error) {
        console.error('获取用户商品列表失败:', error);
        return { success: false, data: [] };
    }
}