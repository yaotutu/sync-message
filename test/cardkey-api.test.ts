import { addCardKey, addUser, deleteCardKey, deleteUser, getUserCardKeys } from '../src/lib/server/db';

async function testCardKeyAPIs() {
    try {
        console.log('开始测试卡密 API...');

        // 创建测试用户
        const addUserResult = await addUser('testuser', 'testpass');
        console.log('添加用户结果:', addUserResult);

        // 添加卡密
        const addCardKeyResult = await addCardKey('testuser');
        console.log('添加卡密结果:', addCardKeyResult);

        // 获取用户卡密
        const getCardKeysResult = await getUserCardKeys('testuser');
        console.log('获取卡密结果:', getCardKeysResult);

        if (getCardKeysResult.success && getCardKeysResult.data.length > 0) {
            // 删除卡密
            const deleteCardKeyResult = await deleteCardKey(getCardKeysResult.data[0].id);
            console.log('删除卡密结果:', deleteCardKeyResult);
        }

        // 删除测试用户
        const deleteUserResult = await deleteUser('testuser');
        console.log('删除用户结果:', deleteUserResult);

        console.log('卡密 API 测试完成');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testCardKeyAPIs(); 