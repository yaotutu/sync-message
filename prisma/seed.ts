import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 创建默认管理员账户
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // 在生产环境中应该使用更强的密码

        const existingAdmin = await prisma.admin.findUnique({
            where: { username: adminUsername }
        });

        if (!existingAdmin) {
            const adminData: Prisma.AdminCreateInput = {
                username: adminUsername,
                password: adminPassword, // 在实际生产环境中应该使用加密密码
            };

            await prisma.admin.create({
                data: adminData
            });
            console.log('默认管理员账户创建成功');
        } else {
            console.log('管理员账户已存在，跳过创建');
        }
    } catch (error) {
        console.error('创建管理员账户时出错:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('Seed 失败:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 