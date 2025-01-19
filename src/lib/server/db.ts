import { prisma } from './prisma';

const DB_PATH = path.join(process.cwd(), 'data/users.db');

interface RunResult {
    changes: number;
    lastID: number;
}

interface User {
    username: string;
    createdAt?: number;
}

interface Product {
    id?: number;
    username: string;
    title: string;
    imageUrl?: string;
    link: string;
    price?: number;
    description?: string;
    notes?: string;
    createdAt?: number;
    updatedAt?: number;
}

// 确保数据目录存在
async function ensureDbExists() {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

// 获取数据库连接
async function getDb() {
    try {
        await ensureDbExists();
        const db = await open({
            filename: DB_PATH,
            driver: sqlite3.Database
        });

        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL,
                created_at INTEGER DEFAULT (unixepoch())
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                title TEXT NOT NULL,
                image_url TEXT,
                link TEXT NOT NULL,
                price REAL,
                description TEXT,
                notes TEXT,
                created_at INTEGER DEFAULT (unixepoch()),
                updated_at INTEGER DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_configs (
                username TEXT PRIMARY KEY,
                page_title TEXT,
                page_description TEXT,
                created_at INTEGER DEFAULT (unixepoch()),
                updated_at INTEGER DEFAULT (unixepoch()),
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS card_keys (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                key TEXT NOT NULL UNIQUE,
                used INTEGER DEFAULT 0,
                message TEXT,
                created_at INTEGER DEFAULT (unixepoch()),
                used_at INTEGER,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
            );
        `);

        return db;
    } catch (error) {
        console.error('数据库连接错误:', error);
        throw error;
    }
}

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
        return user?.password === password;
    } catch (error) {
        console.error('验证用户时发生错误:', error);
        return false;
    }
}

// 添加用户
export async function addUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return { success: false, message: '用户名已存在' };
        }

        await prisma.user.create({
            data: {
                username,
                password
            }
        });

        return { success: true, message: '用户创建成功' };
    } catch (error) {
        console.error('添加用户时发生错误:', error);
        return { success: false, message: '创建用户失败，请稍后重试' };
    }
}

// 更新用户密码
export async function updateUserPassword(username: string, newPassword: string): Promise<void> {
    try {
        await prisma.user.update({
            where: { username },
            data: { password: newPassword }
        });
    } catch (error) {
        throw new Error('用户不存在');
    }
}

// 获取所有用户
export async function getAllUsers(): Promise<{ success: boolean; data: { username: string; createdAt: Date }[] }> {
    try {
        const users = await prisma.user.findMany({
            select: {
                username: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            success: true,
            data: users
        };
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return {
            success: false,
            data: []
        };
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

interface ProductInput {
    id?: number;
    username: string;
    title: string;
    imageUrl?: string | null;
    link: string;
    price?: number | null;
    description?: string | null;
    notes?: string | null;
}

// 添加商品
export async function addProduct(product: ProductInput): Promise<{ success: boolean; message: string; data?: any }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username: product.username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const newProduct = await prisma.product.create({
            data: {
                userId: user.id,
                username: user.username,
                title: product.title,
                imageUrl: product.imageUrl ?? null,
                link: product.link,
                price: product.price ?? null,
                description: product.description ?? null,
                notes: product.notes ?? null
            }
        });

        return {
            success: true,
            message: '商品添加成功',
            data: newProduct
        };
    } catch (error) {
        console.error('添加商品时发生错误:', error);
        return { success: false, message: '添加商品失败，请稍后重试' };
    }
}

// 获取用户商品
export async function getUserProducts(username: string): Promise<{ success: boolean; data: any[] }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, data: [] };
        }

        const products = await prisma.product.findMany({
            where: {
                userId: user.id
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: products
        };
    } catch (error) {
        console.error('获取用户商品列表失败:', error);
        return {
            success: false,
            data: []
        };
    }
}

// 更新商品
export async function updateProduct(product: ProductInput): Promise<{ success: boolean; message: string }> {
    try {
        const productId = product.id;
        if (!productId) {
            return { success: false, message: '商品ID不能为空' };
        }

        const user = await prisma.user.findUnique({
            where: { username: product.username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prisma.product.update({
            where: {
                id: productId,
                userId: user.id
            },
            data: {
                title: product.title,
                imageUrl: product.imageUrl ?? null,
                link: product.link,
                price: product.price ?? null,
                description: product.description ?? null,
                notes: product.notes ?? null
            }
        });

        return { success: true, message: '商品更新成功' };
    } catch (error) {
        console.error('更新商品时发生错误:', error);
        return { success: false, message: '更新商品失败，请稍后重试' };
    }
}

// 删除商品
export async function deleteProduct(id: number, username: string): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prisma.product.delete({
            where: {
                id,
                userId: user.id
            }
        });
        return { success: true, message: '商品删除成功' };
    } catch (error) {
        console.error('删除商品时发生错误:', error);
        return { success: false, message: '删除商品失败，请稍后重试' };
    }
}

// 获取用户配置
export async function getUserConfig(username: string): Promise<{ success: boolean; data?: any }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            include: { config: true }
        });

        if (!user) {
            return { success: false, data: null };
        }

        return {
            success: true,
            data: user.config
        };
    } catch (error) {
        console.error('获取用户配置失败:', error);
        return {
            success: false,
            data: null
        };
    }
}

// 更新用户配置
export async function updateUserConfig(
    username: string,
    config: {
        pageTitle?: string;
        pageDescription?: string;
    }
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        const existingConfig = await prisma.userConfig.findUnique({
            where: { userId: user.id }
        });

        if (existingConfig) {
            await prisma.userConfig.update({
                where: { userId: user.id },
                data: config
            });
        } else {
            await prisma.userConfig.create({
                data: {
                    ...config,
                    userId: user.id
                }
            });
        }

        return { success: true, message: '配置更新成功' };
    } catch (error) {
        console.error('更新用户配置失败:', error);
        return { success: false, message: '更新配置失败，请稍后重试' };
    }
}

// 获取用户卡密
export async function getUserCardKeys(username: string): Promise<{ success: boolean; data: any[] }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, data: [] };
        }

        const cardKeys = await prisma.cardKey.findMany({
            where: {
                userId: user.id
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: cardKeys
        };
    } catch (error) {
        console.error('获取用户卡密列表失败:', error);
        return {
            success: false,
            data: []
        };
    }
}

// 添加卡密
export async function addCardKey(
    username: string,
    key: string,
    message: string
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prisma.cardKey.create({
            data: {
                userId: user.id,
                username: user.username,
                key,
                message
            }
        });

        return { success: true, message: '卡密添加成功' };
    } catch (error) {
        console.error('添加卡密时发生错误:', error);
        return { success: false, message: '添加卡密失败，请稍后重试' };
    }
}

// 删除卡密
export async function deleteCardKey(
    id: number,
    username: string
): Promise<{ success: boolean; message: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        await prisma.cardKey.delete({
            where: {
                id,
                userId: user.id
            }
        });
        return { success: true, message: '卡密删除成功' };
    } catch (error) {
        console.error('删除卡密时发生错误:', error);
        return { success: false, message: '删除卡密失败，请稍后重试' };
    }
}

// 验证卡密
export async function validateCardKey(
    username: string,
    key: string
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return { success: false, error: '用户不存在' };
        }

        const cardKey = await prisma.cardKey.findFirst({
            where: {
                userId: user.id,
                key,
                used: false
            }
        });

        if (!cardKey) {
            return { success: false, error: '无效的卡密' };
        }

        // 更新卡密状态
        await prisma.cardKey.update({
            where: { id: cardKey.id },
            data: {
                used: true,
                usedAt: new Date()
            }
        });

        return {
            success: true,
            message: cardKey.message || '卡密验证成功'
        };
    } catch (error) {
        console.error('验证卡密时发生错误:', error);
        return { success: false, error: '验证卡密失败，请稍后重试' };
    }
} 