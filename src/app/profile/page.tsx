'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ProductConfig {
    id?: string;
    title: string;
    imageUrl: string;
    productUrl: string;
    price: string;
    notes: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [products, setProducts] = useState<ProductConfig[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductConfig | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    useEffect(() => {
        // 从localStorage获取登录信息
        const storedUsername = localStorage.getItem('username');
        const storedPassword = localStorage.getItem('password');
        if (storedUsername && storedPassword) {
            setUsername(storedUsername);
            setPassword(storedPassword);
            fetchUserProducts(storedUsername, storedPassword);
        } else {
            router.push('/login');
        }
    }, []);

    const fetchUserProducts = async (user: string, pass: string) => {
        try {
            const response = await fetch('/api/user/config', {
                headers: {
                    'x-username': user,
                    'x-password': pass
                }
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                if (data.data && Array.isArray(data.data)) {
                    setProducts(data.data);
                }
            } else {
                router.push('/login');
            }
        } catch (error) {
            router.push('/login');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        const formData = new FormData();
        if (selectedImage) {
            formData.append('image', selectedImage);
        }
        formData.append('config', JSON.stringify({
            ...selectedProduct,
            action: isEditing ? 'update' : 'add'
        }));

        try {
            const response = await fetch('/api/user/config', {
                method: 'POST',
                headers: {
                    'x-username': username,
                    'x-password': password
                },
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setMessage(isEditing ? '更新成功' : '添加成功');
                fetchUserProducts(username, password);
                resetForm();
            } else {
                setMessage(data.message || '操作失败');
            }
        } catch (error) {
            setMessage('操作失败，请稍后重试');
        }
    };

    const handleDelete = async (productId: string) => {
        try {
            const response = await fetch('/api/user/config', {
                method: 'POST',
                headers: {
                    'x-username': username,
                    'x-password': password,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: productId,
                    action: 'delete'
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage('删除成功');
                fetchUserProducts(username, password);
            } else {
                setMessage(data.message || '删除失败');
            }
        } catch (error) {
            setMessage('删除失败，请稍后重试');
        }
    };

    const handleEdit = (product: ProductConfig) => {
        setSelectedProduct(product);
        setIsEditing(true);
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setSelectedImage(null);
        setIsEditing(false);
    };

    const handleAddNew = () => {
        setSelectedProduct({
            title: '',
            imageUrl: '',
            productUrl: '',
            price: '',
            notes: ''
        });
        setIsEditing(false);
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-300">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">商品配置</h1>
                        <button
                            onClick={handleAddNew}
                            className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md 
                                     hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                        >
                            添加商品
                        </button>
                    </div>

                    {/* 商品列表 */}
                    <div className="mb-8">
                        <div className="grid gap-4">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        {product.imageUrl && (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.title}
                                                className="w-16 h-16 object-cover rounded-md"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">{product.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">价格: {product.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id!)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 添加/编辑表单 */}
                    {selectedProduct && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                {isEditing ? '编辑商品' : '添加商品'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品标题
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedProduct.title}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            title: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                                 bg-white dark:bg-gray-700 
                                                 text-gray-900 dark:text-white
                                                 shadow-sm focus:border-green-500 focus:ring-green-500
                                                 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品图片
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="mt-1 block w-full text-gray-700 dark:text-gray-300
                                                 file:mr-4 file:py-2 file:px-4
                                                 file:rounded-md file:border-0
                                                 file:text-sm file:font-medium
                                                 file:bg-green-50 file:text-green-700
                                                 dark:file:bg-green-900 dark:file:text-green-300
                                                 hover:file:bg-green-100 dark:hover:file:bg-green-800"
                                    />
                                    {(selectedProduct.imageUrl || selectedImage) && (
                                        <div className="mt-2 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            <img
                                                src={selectedImage ? URL.createObjectURL(selectedImage) : selectedProduct.imageUrl}
                                                alt="商品图片"
                                                className="h-32 w-full object-contain"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品链接
                                    </label>
                                    <input
                                        type="url"
                                        value={selectedProduct.productUrl}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            productUrl: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                                 bg-white dark:bg-gray-700 
                                                 text-gray-900 dark:text-white
                                                 shadow-sm focus:border-green-500 focus:ring-green-500
                                                 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品价格
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            price: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                                 bg-white dark:bg-gray-700 
                                                 text-gray-900 dark:text-white
                                                 shadow-sm focus:border-green-500 focus:ring-green-500
                                                 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        备注
                                    </label>
                                    <textarea
                                        value={selectedProduct.notes}
                                        onChange={(e) => setSelectedProduct({
                                            ...selectedProduct,
                                            notes: e.target.value
                                        })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                                 bg-white dark:bg-gray-700 
                                                 text-gray-900 dark:text-white
                                                 shadow-sm focus:border-green-500 focus:ring-green-500
                                                 dark:focus:border-green-400 dark:focus:ring-green-400"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-green-500 dark:bg-green-600 text-white 
                                                 py-2 px-4 rounded-md 
                                                 hover:bg-green-600 dark:hover:bg-green-700 
                                                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 
                                                 dark:focus:ring-offset-gray-800
                                                 transition-colors"
                                    >
                                        {isEditing ? '更新' : '添加'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200
                                                 py-2 px-4 rounded-md 
                                                 hover:bg-gray-300 dark:hover:bg-gray-700 
                                                 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 
                                                 dark:focus:ring-offset-gray-800
                                                 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-4 text-sm ${message.includes('失败')
                            ? 'text-red-500 dark:text-red-400'
                            : 'text-green-500 dark:text-green-400'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 