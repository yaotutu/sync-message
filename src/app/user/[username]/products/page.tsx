'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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

export default function ProductsPage() {
    const params = useParams();
    const username = params?.username as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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
            const response = await fetch(`/api/user/${username}/products`, {
                headers: {
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                }
            });
            const data = await response.json();
            if (data.success) {
                setProducts(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('加载商品列表失败');
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

            console.log('发送的数据:', requestData);

            const url = `/api/user/${username}/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct ? { ...requestData, id: editingProduct.id } : requestData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();
            console.log('收到的响应:', data);

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
                setError(data.message);
            }
        } catch (err) {
            console.error('提交表单时出错:', err);
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
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                },
                body: JSON.stringify({ id })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                loadProducts();
            } else {
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
                headers: {
                    'x-username': username,
                    'x-password': localStorage.getItem('password') || ''
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setFormData(prev => ({
                    ...prev,
                    imageUrl: data.data.url
                }));
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('图片上传失败，请稍后重试');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">商品管理</h1>
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
                <div className="bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-300 p-4 rounded-md">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/50 text-green-500 dark:text-green-300 p-4 rounded-md">
                    {success}
                </div>
            )}

            {showForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                        {editingProduct ? '编辑商品' : '添加新商品'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                商品名称
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
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
                                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                                             file:mr-4 file:py-2 file:px-4
                                             file:rounded-md file:border-0
                                             file:text-sm file:font-semibold
                                             file:bg-green-50 file:text-green-700
                                             dark:file:bg-green-900/50 dark:file:text-green-300
                                             hover:file:bg-green-100 dark:hover:file:bg-green-900"
                                />
                                {isUploading && <span className="text-gray-500 dark:text-gray-400">上传中...</span>}
                            </div>
                            {formData.imageUrl && (
                                <div className="mt-2">
                                    <img
                                        src={formData.imageUrl}
                                        alt="商品图片预览"
                                        className="h-32 w-32 object-cover rounded-md"
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
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                价格
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price || ''}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                商品描述
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
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
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-white
                                         shadow-sm focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 
                                         text-gray-700 dark:text-gray-300 rounded-md
                                         hover:bg-gray-50 dark:hover:bg-gray-700
                                         focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                取消
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-md
                                         hover:bg-green-600 dark:hover:bg-green-700
                                         focus:outline-none focus:ring-2 focus:ring-green-500
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '保存中...' : '保存'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(product => (
                    <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
                        {product.imageUrl && (
                            <div className="aspect-w-16 aspect-h-9">
                                <img
                                    src={product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-48 object-cover"
                                />
                            </div>
                        )}
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex-grow space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {product.title}
                                    </h3>
                                    {product.price && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            价格: ¥{product.price}
                                        </p>
                                    )}
                                </div>
                                {product.description && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {product.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <a
                                    href={product.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 text-sm text-green-600 dark:text-green-400 
                                             hover:text-green-800 dark:hover:text-green-300"
                                >
                                    查看
                                </a>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 
                                             hover:text-blue-800 dark:hover:text-blue-300"
                                >
                                    编辑
                                </button>
                                <button
                                    onClick={() => product.id && handleDelete(product.id)}
                                    className="px-3 py-1 text-sm text-red-600 dark:text-red-400 
                                             hover:text-red-800 dark:hover:text-red-300"
                                >
                                    删除
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 