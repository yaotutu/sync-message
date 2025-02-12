import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

export const db = prismaClient;

// 验证管理员密码
export async function validateAdminPassword(username: string, password: string): Promise<boolean> {
    try {
        const admin = await prismaClient.admin.findUnique({
            where: { username }
        });

        if (!admin) {
            return false;
        }

        return admin.password === password; // 在实际生产环境中应该使用加密比较
    } catch (error) {
        console.error('验证管理员密码失败:', error);
        return false;
    }
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

// 获取用户商品列表
export async function getUserProducts(username: string) {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            include: { products: true }
        });

        if (!user) {
            return { success: false, message: '用户不存在', data: [] };
        }

        return { success: true, data: user.products };
    } catch (error) {
        console.error('获取用户商品列表失败:', error);
        return { success: false, message: '获取用户商品列表失败', data: [] };
    }
}

// 添加商品
export async function addProduct(username: string, data: {
    name: string;
    description?: string;
    price?: number;
    imageUrl?: string;
}) {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const product = await prismaClient.product.create({
            data: {
                ...data,
                userId: user.id
            }
        });

        return { success: true, message: '商品添加成功', data: product };
    } catch (error) {
        console.error('添加商品失败:', error);
        return { success: false, message: '添加商品失败' };
    }
}

// 更新商品
export async function updateProduct(productId: string, data: {
    name?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
}) {
    try {
        const product = await prismaClient.product.update({
            where: { id: productId },
            data
        });

        return { success: true, message: '商品更新成功', data: product };
    } catch (error) {
        console.error('更新商品失败:', error);
        return { success: false, message: '更新商品失败' };
    }
}

// 删除商品
export async function deleteProduct(productId: string) {
    try {
        await prismaClient.product.delete({
            where: { id: productId }
        });

        return { success: true, message: '商品删除成功' };
    } catch (error) {
        console.error('删除商品失败:', error);
        return { success: false, message: '删除商品失败' };
    }
}

export async function validateUserPassword(username: string, password: string): Promise<boolean> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return false;
        }

        return user.password === password; // 在实际生产环境中应该使用加密比较
    } catch (error) {
        console.error('验证用户密码失败:', error);
        return false;
    }
}

// 获取所有用户
export async function getAllUsers(): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        const users = await prismaClient.user.findMany({
            select: {
                username: true,
                webhookKey: true,
                createdAt: true,
            }
        });
        return { success: true, data: users };
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return { success: false, message: '获取用户列表失败' };
    }
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
        const existingUser = await prismaClient.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return { success: false, message: '用户名已存在' };
        }

        await prismaClient.user.create({
            data: {
                username,
                password,
                webhookKey: generateWebhookKey() // 生成一个随机的 webhook key
            }
        });

        return { success: true, message: '用户创建成功' };
    } catch (error) {
        console.error('创建用户失败:', error);
        return { success: false, message: '创建用户失败' };
    }
}

// 删除用户
export async function deleteUser(username: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prismaClient.user.delete({
            where: { username }
        });

        return { success: true, message: '用户删除成功' };
    } catch (error) {
        console.error('删除用户失败:', error);
        return { success: false, message: '删除用户失败' };
    }
}

// 生成 webhook key
function generateWebhookKey(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 验证 webhook key
export async function validateWebhookKey(webhookKey: string): Promise<{ success: boolean; message?: string }> {
    try {
        console.log('Validating webhook key:', webhookKey);
        const user = await prismaClient.user.findUnique({
            where: { webhookKey }
        });

        console.log('Found user:', user);

        if (!user) {
            console.log('No user found with webhook key:', webhookKey);
            return { success: false, message: 'Webhook Key 无效' };
        }

        return { success: true };
    } catch (error) {
        console.error('验证 Webhook Key 失败:', error);
        return { success: false, message: '验证失败' };
    }
}

// 添加消息
export async function addMessage(username: string, content: string, receivedAt?: Date): Promise<{ success: boolean; message?: string }> {
    try {
        console.log('Adding message for user:', username);
        console.log('Message content:', content);
        console.log('Received at:', receivedAt);

        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        console.log('Found user:', user);

        if (!user) {
            console.log('No user found with username:', username);
            return { success: false, message: '用户不存在' };
        }

        const message = await prismaClient.message.create({
            data: {
                content,
                userId: user.id,
                receivedAt: receivedAt || new Date()
            }
        });

        console.log('Created message:', message);
        return { success: true, message: '消息添加成功' };
    } catch (error) {
        console.error('添加消息失败:', error);
        return { success: false, message: '添加消息失败' };
    }
}