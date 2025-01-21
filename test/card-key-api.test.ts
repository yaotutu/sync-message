import { addCardKey, addUser, deleteCardKey, deleteUser, getUserCardKeys } from '../src/lib/server/db';

async function testCardKeyAPIs() {
    try {
        // 首先创建测试用户
        console.log('开始测试卡密 API...');
        let result = await addUser('testuser', 'testpass');
        console.log('1. 创建测试用户:', result);

        // 测试添加卡密
        console.log('\n2. 测试添加卡密');
        result = await addCardKey('testuser');
        console.log(result);

        // 测试获取用户卡密列表
        console.log('\n3. 测试获取用户卡密列表');
        const cardKeysResult = await getUserCardKeys('testuser');
        console.log(cardKeysResult);

        // 如果有卡密，测试删除
        if (cardKeysResult.data.length > 0) {
            console.log('\n4. 测试删除卡密');
            result = await deleteCardKey(cardKeysResult.data[0].id);
            console.log(result);
        }

        // 清理测试用户
        console.log('\n5. 清理测试用户');
        result = await deleteUser('testuser');
        console.log(result);

        console.log('\n卡密 API 测试完成');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testCardKeyAPIs(); 