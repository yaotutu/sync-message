'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

interface Product {
    id: string;
    title: string;
    link: string;
    imageUrl: string | null;
    price: number | null;
    description: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ProductFormData {
    title: string;
    link: string;
    imageUrl?: string;
    price?: number;
    description?: string;
    notes?: string;
}

interface ProductsPageProps {
    params: Promise<{ username: string }>;
}

export default function ProductsPage({ params: paramsPromise }: ProductsPageProps) {
    const router = useRouter();
    const { username } = use(paramsPromise);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        link: '',
        imageUrl: '',
        price: 0,
        description: '',
        notes: ''
    });

    // 加载商品列表
    const loadProducts = async () => {
        try {
            const response = await fetch(`/api/user/${username}/products`);
            const result = await response.json();

            if (result.success) {
                setProducts(result.data);
            } else {
                toast.error(result.message || '加载商品列表失败');
            }
        } catch (error) {
            toast.error('加载商品列表失败');
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
            [name]: name === 'price' ? Number(value) || 0 : value
        }));
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = `/api/user/${username}/products`;
            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct ? { ...formData, id: editingProduct.id } : formData;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                setShowForm(false);
                setEditingProduct(null);
                setFormData({
                    title: '',
                    link: '',
                    imageUrl: '',
                    price: 0,
                    description: '',
                    notes: ''
                });
                loadProducts();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('操作失败，请重试');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 编辑商品
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            link: product.link,
            imageUrl: product.imageUrl || '',
            price: product.price || 0,
            description: product.description || '',
            notes: product.notes || ''
        });
        setShowForm(true);
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

            const result = await response.json();

            if (result.success) {
                toast.success(result.message);
                loadProducts();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('删除失败，请重试');
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
            <Toaster />
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
                                        link: '',
                                        imageUrl: '',
                                        price: 0,
                                        description: '',
                                        notes: ''
                                    });
                                }}
                                className="bg-green-500 dark:bg-green-600 text-white px-4 py-2 rounded-md 
                                        hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
                            >
                                {showForm ? '取消' : '添加商品'}
                            </button>
                        </div>

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
                                        商品图片链接
                                    </label>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
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
                                        disabled={isSubmitting}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                    >
                                        {isSubmitting ? '保存中...' : (editingProduct ? '更新商品' : '添加商品')}
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
                                    {product.price !== null && (
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
                                            onClick={() => handleDelete(product.id)}
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