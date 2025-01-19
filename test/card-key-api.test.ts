import { addCardKey, addUser, deleteCardKey, getUserCardKeys, validateCardKey } from '../src/lib/server/db';
import { prisma } from '../src/lib/server/prisma';

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

async function testCardKeyAPIs() {
    try {
        // 首先创建测试用户
        console.log('1. 创建测试用户');
        let result = await addUser('testuser', 'password123');
        console.log(result);

        // 测试添加卡密
        console.log('\n2. 测试添加卡密');
        result = await addCardKey('testuser', 'TEST-KEY-001', '测试卡密');
        console.log(result);

        // 测试获取用户卡密列表
        console.log('\n3. 测试获取用户卡密列表');
        const cardKeysResult = await getUserCardKeys('testuser');
        console.log(cardKeysResult);

        // 测试验证卡密
        console.log('\n4. 测试验证卡密');
        const validateResult = await validateCardKey('testuser', 'TEST-KEY-001');
        console.log(validateResult);

        // 测试验证已使用的卡密
        console.log('\n5. 测试验证已使用的卡密');
        const validateUsedResult = await validateCardKey('testuser', 'TEST-KEY-001');
        console.log(validateUsedResult);

        // 测试删除卡密
        console.log('\n6. 测试删除卡密');
        const cardKeys = await getUserCardKeys('testuser');
        if (cardKeys.data.length > 0) {
            result = await deleteCardKey(cardKeys.data[0].id, 'testuser');
            console.log(result);
        }

        // 清理测试用户
        await prisma.user.delete({ where: { username: 'testuser' } });
        await prisma.$disconnect();
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        await prisma.$disconnect();
    }
}

testCardKeyAPIs(); 