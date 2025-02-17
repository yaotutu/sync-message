import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 从环境变量获取管理员配置
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2024';

    try {
        // 检查管理员是否已存在
        const existingAdmin = await prisma.admin.findUnique({
            where: { username: adminUsername }
        });

        // 加密密码
        const hashedPassword = await hash(adminPassword, 10);

        if (!existingAdmin) {
            // 创建管理员账号
            await prisma.admin.create({
                data: {
                    username: adminUsername,
                    password: hashedPassword,
                }
            });
            console.log('✅ 管理员账号创建成功');
        } else {
            // 更新管理员密码
            await prisma.admin.update({
                where: { username: adminUsername },
                data: { password: hashedPassword }
            });
            console.log('✅ 管理员账号更新成功');
        }
    } catch (error) {
        console.error('❌ 初始化管理员账号失败:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 