import { addProduct, addUser, deleteProduct, deleteUser, getUserProducts, updateProduct } from '../src/lib/server/db';

async function testProductAPIs() {
    try {
        console.log('开始测试产品 API...');

        // 创建测试用户
        const addUserResult = await addUser('testuser', 'testpass');
        console.log('添加用户结果:', addUserResult);

        // 添加产品
        const addProductResult = await addProduct({
            title: '测试产品',
            userId: 'testuser',
            imageUrl: 'https://example.com/image.jpg',
            price: 99.99,
            description: '这是一个测试产品',
            notes: '测试备注'
        });
        console.log('添加产品结果:', addProductResult);

        // 获取用户产品
        const getProductsResult = await getUserProducts('testuser');
        console.log('获取产品结果:', getProductsResult);

        if (getProductsResult.success && getProductsResult.data.length > 0) {
            // 更新产品
            const updateResult = await updateProduct(getProductsResult.data[0].id, {
                title: '更新后的产品',
                price: 199.99
            });
            console.log('更新产品结果:', updateResult);

            // 删除产品
            const deleteProductResult = await deleteProduct(getProductsResult.data[0].id);
            console.log('删除产品结果:', deleteProductResult);
        }

        // 删除测试用户
        const deleteUserResult = await deleteUser('testuser');
        console.log('删除用户结果:', deleteUserResult);

        console.log('产品 API 测试完成');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testProductAPIs(); 