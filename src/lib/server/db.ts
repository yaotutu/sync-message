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
    userId?: string;
    data?: {
        usedAt: Date;
        expireTime: Date;
        userId: string;
    };
}> {
    try {
        const cardKey = await prismaClient.cardKey.findUnique({
            where: { key },
            include: {
                user: {
                    include: {
                        config: true
                    }
                }
            }
        });

        if (!cardKey) {
            return { success: false, message: '卡密不存在' };
        }

        // 检查是否已使用
        if (cardKey.usedAt) {
            const now = new Date();
            // 获取用户配置的过期时间，如果没有则使用默认值
            const expireMinutes = cardKey.user.config?.cardKeyExpireMinutes ||
                Number(process.env.DEFAULT_CARDKEY_EXPIRE_MINUTES) ||
                5;

            // 计算过期时间
            const expireTime = new Date(cardKey.usedAt.getTime() + expireMinutes * 60 * 1000);

            if (now > expireTime) {
                return { success: false, message: '卡密已过期' };
            }

            return {
                success: true,
                message: '卡密有效',
                userId: cardKey.userId,
                data: {
                    usedAt: cardKey.usedAt,
                    expireTime,
                    userId: cardKey.userId
                }
            };
        }

        // 如果未使用，更新使用时间
        const updatedCardKey = await prismaClient.cardKey.update({
            where: { key },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

        // 获取用户配置的过期时间
        const expireMinutes = cardKey.user.config?.cardKeyExpireMinutes ||
            Number(process.env.DEFAULT_CARDKEY_EXPIRE_MINUTES) ||
            5;

        const expireTime = new Date(updatedCardKey.usedAt!.getTime() + expireMinutes * 60 * 1000);

        return {
            success: true,
            message: '卡密验证成功',
            userId: updatedCardKey.userId,
            data: {
                usedAt: updatedCardKey.usedAt!,
                expireTime,
                userId: updatedCardKey.userId
            }
        };
    } catch (error) {
        console.error('验证卡密失败:', error);
        return { success: false, message: '验证卡密失败' };
    }
}

// 获取用户配置
interface UserConfigData {
    title?: string;
    theme?: string;
    language?: string;
    cardKeyExpireMinutes?: number;
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
    data: UserConfigData
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        // 过滤掉 undefined 值
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== undefined)
        );

        // 如果没有有效数据要更新，直接返回成功
        if (Object.keys(filteredData).length === 0) {
            return { success: true, message: '无需更新' };
        }

        await prismaClient.userConfig.upsert({
            where: { userId: user.id },
            update: filteredData,
            create: {
                userId: user.id,
                ...filteredData
            }
        });

        return { success: true, message: '用户配置更新成功' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('更新用户配置失败:', errorMessage);
        return { success: false, message: '更新用户配置失败' };
    }
}

// 商品相关类型定义
export interface ProductInput {
    title: string;
    link: string;
    imageUrl?: string | null;
    price?: number | null;
    description?: string | null;
    notes?: string | null;
}

export interface ProductUpdateInput extends Partial<ProductInput> {
    id: string;
}

// 获取用户商品列表
export async function getUserProducts(username: string) {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            select: {
                id: true,
                products: {
                    select: {
                        id: true,
                        title: true,
                        link: true,
                        imageUrl: true,
                        price: true,
                        description: true,
                        notes: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!user) {
            return { success: false, message: '用户不存在', data: [] };
        }

        return {
            success: true,
            message: '获取成功',
            data: user.products
        };
    } catch (error) {
        // 改进错误处理
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('获取用户商品列表失败:', errorMessage);

        return {
            success: false,
            message: '获取商品列表失败',
            data: []
        };
    }
}

// 添加商品
export async function addProduct(username: string, data: ProductInput) {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username },
            select: { id: true }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const product = await prismaClient.product.create({
            data: {
                userId: user.id,
                title: data.title,
                link: data.link,
                imageUrl: data.imageUrl,
                price: data.price,
                description: data.description,
                notes: data.notes
            }
        });

        return {
            success: true,
            message: '添加商品成功',
            data: product
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('添加商品失败:', errorMessage);
        return {
            success: false,
            message: '添加商品失败'
        };
    }
}

// 更新商品
export async function updateProduct(username: string, data: ProductUpdateInput) {
    try {
        // 首先验证商品是否属于该用户
        const product = await prismaClient.product.findFirst({
            where: {
                id: data.id,
                user: {
                    username
                }
            }
        });

        if (!product) {
            return {
                success: false,
                message: '商品不存在或无权限修改'
            };
        }

        const updatedProduct = await prismaClient.product.update({
            where: { id: data.id },
            data: {
                title: data.title,
                link: data.link,
                imageUrl: data.imageUrl,
                price: data.price,
                description: data.description,
                notes: data.notes
            }
        });

        return {
            success: true,
            message: '更新商品成功',
            data: updatedProduct
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        console.error('更新商品失败:', errorMessage);
        return {
            success: false,
            message: '更新商品失败'
        };
    }
}

// 删除商品
export async function deleteProduct(username: string, productId: string) {
    try {
        // 首先验证商品是否属于该用户
        const product = await prismaClient.product.findFirst({
            where: {
                id: productId,
                user: {
                    username
                }
            }
        });

        if (!product) {
            return {
                success: false,
                message: '商品不存在或无权限删除'
            };
        }

        await prismaClient.product.delete({
            where: { id: productId }
        });

        return {
            success: true,
            message: '删除商品成功'
        };
    } catch (error) {
        console.error('删除商品失败:', error);
        return {
            success: false,
            message: '删除商品失败'
        };
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
export async function validateWebhookKey(webhookKey: string): Promise<{
    success: boolean;
    message?: string;
    user?: { id: string; username: string; }
}> {
    try {
        console.log('Validating webhook key:', webhookKey);
        const user = await prismaClient.user.findUnique({
            where: { webhookKey },
            select: {
                id: true,
                username: true
            }
        });

        console.log('Found user:', user);

        if (!user) {
            console.log('No user found with webhook key:', webhookKey);
            return { success: false, message: 'Webhook Key 无效' };
        }

        return { success: true, user };
    } catch (error) {
        console.error('验证 Webhook Key 失败:', error);
        return { success: false, message: '验证失败' };
    }
}

// 添加消息
export async function addMessage(userId: string, content: string, receivedAt?: Date): Promise<{ success: boolean; message?: string }> {
    try {
        console.log('Adding message for user ID:', userId);
        console.log('Message content:', content);
        console.log('Received at:', receivedAt);

        const message = await prismaClient.message.create({
            data: {
                content,
                userId,
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

// 获取用户消息
export async function getUserMessages(userId: string): Promise<{ success: boolean; data?: any[]; message?: string }> {
    try {
        const messages = await prismaClient.message.findMany({
            where: { userId },
            orderBy: { receivedAt: 'desc' }
        });

        return { success: true, data: messages };
    } catch (error) {
        console.error('获取用户消息失败:', error);
        return { success: false, message: '获取用户消息失败', data: [] };
    }
}