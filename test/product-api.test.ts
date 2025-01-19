import type { Product } from '@prisma/client';
import { addProduct, addUser, deleteProduct, getUserProducts, updateProduct } from '../src/lib/server/db';
import { prisma } from '../src/lib/server/prisma';

interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

async function testProductAPIs() {
    try {
        // 首先创建测试用户
        console.log('1. 创建测试用户');
        let result = await addUser('testuser', 'password123');
        console.log(result);

        // 测试添加商品
        console.log('\n2. 测试添加商品');
        const productData = {
            username: 'testuser',
            title: '测试商品',
            imageUrl: 'https://example.com/image.jpg',
            link: 'https://example.com/product',
            price: 99.99,
            description: '这是一个测试商品',
            notes: '测试备注'
        };
        const addResult = await addProduct(productData) as ApiResponse<Product>;
        console.log(addResult);
        const productId = addResult.data?.id;

        // 测试获取用户商品列表
        console.log('\n3. 测试获取用户商品列表');
        const products = await getUserProducts('testuser');
        console.log(products);

        // 测试更新商品
        console.log('\n4. 测试更新商品');
        if (productId) {
            const updateData = {
                ...productData,
                id: productId,
                title: '更新后的商品名称',
                price: 199.99
            };
            result = await updateProduct(updateData);
            console.log(result);
        }

        // 测试删除商品
        console.log('\n5. 测试删除商品');
        if (productId) {
            result = await deleteProduct(productId, 'testuser');
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

testProductAPIs(); 