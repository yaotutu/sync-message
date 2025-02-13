'use client';

import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';

interface Product {
    id?: string;
    title: string;
    imageUrl?: string;
    link: string;
    price?: number;
    description?: string;
    notes?: string;
    createdAt?: number;
    updatedAt?: number;
}

interface ProductsPageProps {
    params: Promise<{ username: string }>;
}

export default function ProductsPage({ params }: ProductsPageProps) {
    const { username } = use(params);
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 新商品表单状态
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Product>({
        title: '',
        imageUrl: '',
        link: '',
        price: 0,
        description: '',
        notes: ''
    });

    const [isUploading, setIsUploading] = useState(false);

    // 加载商品列表
    const loadProducts = async () => {
        try {
            const response = await fetch(`/api/user/${username}/products`);
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message);
            }
        } catch (err) {
            setError('加载商品列表失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [username]);

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value
        }));
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // 验证必需字段
            if (!formData.title || !formData.link) {
                setError('商品标题和链接是必需的');
                return;
            }

            // 构造请求数据
            const requestData = {
                ...formData,
                price: formData.price ? Number(formData.price) : undefined,
                imageUrl: formData.imageUrl || undefined,
                description: formData.description || undefined,
                notes: formData.notes || undefined
            };

            const url = `/api/user/${username}/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct ? { ...requestData, id: editingProduct.id } : requestData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                    title: '',
                    imageUrl: '',
                    link: '',
                    price: 0,
                    description: '',
                    notes: ''
                });
                loadProducts();
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message);
            }
        } catch (err) {
            setError('保存商品失败，请稍后重试');
        } finally {
            setIsLoading(false);
        }
    };

    // 编辑商品
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            imageUrl: product.imageUrl || '',
            link: product.link,
            price: product.price || 0,
            description: product.description || '',
            notes: product.notes || ''
        });
        setShowForm(true);
        setError('');
        setSuccess('');
    };

    // 删除商品
    const handleDelete = async (id: string) => {
        if (!confirm('确定要删除这个商品吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/user/${username}/products`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                loadProducts();
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message);
            }
        } catch (err) {
            setError('删除商品失败，请稍后重试');
        }
    };

    // 处理图片上传
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`/api/user/${username}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: data.data.url
                }));
            } else {
                if (data.message === '未登录') {
                    router.push(`/user/${username}`);
                    return;
                }
                setError(data.message);
            }
        } catch (err) {
            setError('图片上传失败，请稍后重试');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                商品管理 - {username}
                            </h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => router.push(`/user/${username}`)}
                                className="ml-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                返回用户中心
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => {
                                    setShowForm(!showForm);
                                    setEditingProduct(null);
                                    setFormData({
                                        title: '',
                                        imageUrl: '',
                                        link: '',
                                        price: 0,
                                        description: '',
                                        notes: ''
                                    });
                                    setError('');
                                    setSuccess('');
                                }}
                                className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md 
                                        hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                            >
                                {showForm ? '取消' : '添加商品'}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 text-red-500 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 text-green-500 text-sm">
                                {success}
                            </div>
                        )}

                        {showForm && (
                            <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品标题
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品链接
                                    </label>
                                    <input
                                        type="url"
                                        name="link"
                                        value={formData.link}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        价格
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品图片
                                    </label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploading}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-300
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100
                                                    dark:file:bg-blue-900 dark:file:text-blue-200"
                                        />
                                        {isUploading && <span className="text-sm text-gray-500">上传中...</span>}
                                    </div>
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="商品预览"
                                            className="mt-2 h-32 w-32 object-cover rounded-md"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        商品描述
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        备注
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows={2}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isLoading ? '保存中...' : (editingProduct ? '更新商品' : '添加商品')}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-white dark:bg-gray-700 shadow rounded-lg p-6 space-y-4"
                                >
                                    {product.imageUrl && (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.title}
                                            className="w-full h-48 object-cover rounded-md"
                                        />
                                    )}
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {product.title}
                                    </h3>
                                    {product.price !== undefined && (
                                        <p className="text-green-600 dark:text-green-400 font-medium">
                                            ¥{product.price.toFixed(2)}
                                        </p>
                                    )}
                                    {product.description && (
                                        <p className="text-gray-500 dark:text-gray-300 text-sm">
                                            {product.description}
                                        </p>
                                    )}
                                    {product.notes && (
                                        <p className="text-gray-400 dark:text-gray-400 text-sm">
                                            备注: {product.notes}
                                        </p>
                                    )}
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            编辑
                                        </button>
                                        <button
                                            onClick={() => product.id && handleDelete(product.id)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 