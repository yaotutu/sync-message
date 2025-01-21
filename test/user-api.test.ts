import { addUser, deleteUser, getAllUsers, validateUser } from '../src/lib/server/db';

async function testUserAPIs() {
    try {
        console.log('开始测试用户 API...');

        // 测试添加用户
        const addResult = await addUser('testuser', 'testpass');
        console.log('添加用户结果:', addResult);

        // 测试验证用户
        const validateResult = await validateUser('testuser', 'testpass');
        console.log('验证用户结果:', validateResult);

        // 测试获取所有用户
        const getAllResult = await getAllUsers();
        console.log('获取所有用户结果:', getAllResult);

        // 测试删除用户
        const deleteResult = await deleteUser('testuser');
        console.log('删除用户结果:', deleteResult);

        console.log('用户 API 测试完成');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testUserAPIs(); 