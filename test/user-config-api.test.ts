import { addUser, getUserConfig, updateUserConfig } from '../src/lib/server/db';
import { prisma } from '../src/lib/server/prisma';

async function testUserConfigAPIs() {
    try {
        // 首先创建测试用户
        console.log('1. 创建测试用户');
        let result = await addUser('testuser', 'password123');
        console.log(result);

        // 测试获取用户配置（应该为空）
        console.log('\n2. 测试获取用户配置（初始）');
        const configResult = await getUserConfig('testuser');
        console.log(configResult);

        // 测试更新用户配置
        console.log('\n3. 测试更新用户配置');
        result = await updateUserConfig('testuser', {
            pageTitle: '测试标题',
            pageDescription: '测试描述'
        });
        console.log(result);

        // 测试获取更新后的用户配置
        console.log('\n4. 测试获取更新后的用户配置');
        const updatedConfig = await getUserConfig('testuser');
        console.log(updatedConfig);

        // 清理测试用户
        await prisma.user.delete({ where: { username: 'testuser' } });
        await prisma.$disconnect();
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        await prisma.$disconnect();
    }
}

testUserConfigAPIs(); 