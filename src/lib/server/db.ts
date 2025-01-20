import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

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
        const user = await prismaClient.user.findUnique({
            where: { username }
        });
        return user?.password === password;
    } catch (error) {
        console.error('验证用户失败:', error);
        return false;
    }
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const user = await prismaClient.user.create({
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
export async function getAllUsers(): Promise<{ success: boolean; data: any[] }> {
    try {
        const users = await prismaClient.user.findMany();
        return { success: true, data: users };
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return { success: false, data: [] };
    }
}

// 删除用户
export async function deleteUser(username: string): Promise<{ success: boolean; message: string }> {
    try {
        await prismaClient.user.delete({
            where: { username }
        });
        return { success: true, message: '用户删除成功' };
    } catch (error) {
        console.error('删除用户失败:', error);
        return { success: false, message: '删除用户失败' };
    }
}

// 添加商品
interface ProductData {
    title: string;
    userId: string;
    imageUrl?: string;
    price?: number;
    description?: string;
    notes?: string;
}

export async function addProduct(data: ProductData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        // 首先检查用户是否存在
        const user = await prismaClient.user.findUnique({
            where: { username: data.userId }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const product = await prismaClient.product.create({
            data: {
                title: data.title,
                userId: user.id,
                imageUrl: data.imageUrl || null,
                price: data.price || null,
                description: data.description || null,
                notes: data.notes || null
            }
        });
        return { success: true, message: '产品创建成功', data: product };
    } catch (error) {
        console.error('创建产品失败:', error);
        return { success: false, message: '创建产品失败' };
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
        console.error('获取用户产品列表失败:', error);
        return { success: false, data: [] };
    }
}

// 更新商品
export async function updateProduct(id: string, data: Partial<ProductData>): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const product = await prismaClient.product.update({
            where: { id },
            data: {
                title: data.title,
                imageUrl: data.imageUrl || null,
                price: data.price || null,
                description: data.description || null,
                notes: data.notes || null
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
        await prismaClient.product.delete({
            where: { id }
        });
        return { success: true, message: '产品删除成功' };
    } catch (error) {
        console.error('删除产品失败:', error);
        return { success: false, message: '删除产品失败' };
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
export async function updateUserConfig(username: string, data: UserConfigData): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prismaClient.userConfig.upsert({
            where: { userId: user.id },
            update: {
                theme: data.theme || null,
                language: data.language || null
            },
            create: {
                userId: user.id,
                theme: data.theme || null,
                language: data.language || null
            }
        });

        return { success: true, message: '用户配置更新成功' };
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return { success: false, message: '更新用户配置失败' };
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

        return { success: true, data: user.cardKeys };
    } catch (error) {
        console.error('获取用户卡密列表失败:', error);
        return { success: false, data: [] };
    }
}

// 添加卡密
export async function addCardKey(username: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const user = await prismaClient.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const cardKey = await prismaClient.cardKey.create({
            data: {
                userId: user.id,
                key: Math.random().toString(36).substring(2, 15),
                status: 'UNUSED'
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
export async function validateCardKey(key: string): Promise<boolean> {
    try {
        const cardKey = await prismaClient.cardKey.findFirst({
            where: { key, status: 'UNUSED' }
        });

        if (!cardKey) {
            return false;
        }

        await prismaClient.cardKey.update({
            where: { id: cardKey.id },
            data: { status: 'USED' }
        });

        return true;
    } catch (error) {
        console.error('验证卡密失败:', error);
        return false;
    }
} 