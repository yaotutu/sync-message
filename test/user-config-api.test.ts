import { addUser, deleteUser, getUserConfig, updateUserConfig } from '../src/lib/server/db';
import { prisma } from '../src/lib/server/prisma';

interface TestResult {
    success: boolean;
    message?: string;
    data?: any;
}

async function testUserConfigAPIs() {
    try {
        console.log('开始测试用户配置 API...');

        // 创建测试用户
        const addResult = await addUser('testuser', 'testpass');
        console.log('添加用户结果:', addResult);

        // 更新用户配置
        const updateResult = await updateUserConfig('testuser', {
            theme: 'dark',
            language: 'zh-CN'
        });
        console.log('更新配置结果:', updateResult);

        // 获取用户配置
        const getResult = await getUserConfig('testuser');
        console.log('获取配置结果:', getResult);

        // 删除测试用户
        const deleteResult = await deleteUser('testuser');
        console.log('删除用户结果:', deleteResult);

        console.log('用户配置 API 测试完成');

        // 清理测试用户
        await prisma.user.delete({ where: { username: 'testuser' } });
        await prisma.$disconnect();
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        await prisma.$disconnect();
    }
}

testUserConfigAPIs(); 