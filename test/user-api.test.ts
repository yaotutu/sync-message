import { addUser, deleteUser, getAllUsers, updateUserPassword, validateUser } from '../src/lib/server/db';
import { prisma } from '../src/lib/server/prisma';

interface TestResult {
    success: boolean;
    message?: string;
    data?: any;
}

async function testUserAPIs() {
    try {
        console.log('1. 测试添加用户');
        let result: TestResult = await addUser('testuser', 'password123');
        console.log(result);

        console.log('\n2. 测试用户验证');
        const isValid = await validateUser('testuser', 'password123');
        console.log('用户验证结果:', isValid);

        console.log('\n3. 测试获取所有用户');
        const users = await getAllUsers();
        console.log(users);

        console.log('\n4. 测试更新用户密码');
        await updateUserPassword('testuser', 'newpassword123');
        const isValidAfterUpdate = await validateUser('testuser', 'newpassword123');
        console.log('密码更新后验证结果:', isValidAfterUpdate);

        console.log('\n5. 测试删除用户');
        result = await deleteUser('testuser');
        console.log(result);

        await prisma.$disconnect();
    } catch (error) {
        console.error('测试过程中发生错误:', error);
        await prisma.$disconnect();
    }
}

testUserAPIs(); 