'use client';

import React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LinkedCardKey } from '@/types/cardKey';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { linkedCardKeyService } from '@/lib/api/services';

interface LinkedCardKeysPageProps {
    params: Promise<{ username: string }>;
}

const APP_OPTIONS = [
    { value: 'jianying', label: '剪映' },
    { value: 'douyin', label: '抖音' },
    { value: 'other', label: '其他' },
];

type FilterStatus = 'all' | 'used' | 'unused';

interface FormData {
    count: number;
    phones: string[];
    appName: string;
    linkParams: {
        includePhone: boolean;
        includeAppName: boolean;
    };
}

export default function LinkedCardKeysPage({ params }: LinkedCardKeysPageProps) {
    const { username } = use(params);
    const router = useRouter();
    const [cardKeys, setCardKeys] = useState<LinkedCardKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        count: 1,
        phones: [''],
        appName: 'jianying',
        linkParams: {
            includePhone: false,
            includeAppName: false,
        }
    });

    // 新增状态
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCardKeys = async () => {
        try {
            const response = await linkedCardKeyService.getCardKeys(username);
            if (response.success) {
                setCardKeys(response.data || []);
                setError(null);
            } else {
                setError(response.message || '获取卡密列表失败');
                if (response.message?.includes('未登录') || response.message?.includes('认证')) {
                    router.push('/user');
                }
            }
        } catch (error) {
            setError('获取卡密列表失败');
        } finally {
            setLoading(false);
        }
    };

    const generateLinkedCardKeys = async () => {
        if (generating) return;

        try {
            setGenerating(true);
            setError(null);

            // 过滤掉空的手机号
            const validPhones = formData.phones.filter(phone => phone.trim() !== '');

            if (formData.linkParams.includePhone && validPhones.length === 0) {
                setError('请至少输入一个手机号');
                return;
            }

            const response = await linkedCardKeyService.generateCardKeys(username, {
                count: formData.count,
                phones: validPhones,
                appName: formData.appName,
                linkParams: formData.linkParams
            });

            if (response.success) {
                await fetchCardKeys();
                setError(`成功生成 ${formData.count} 个带链接卡密`);
                setTimeout(() => setError(null), 3000);
            } else {
                setError(response.message || '生成卡密失败');
                if (response.message?.includes('未登录') || response.message?.includes('认证')) {
                    router.push('/user');
                }
            }
        } catch (error) {
            setError('生成卡密失败，请稍后重试');
        } finally {
            setGenerating(false);
        }
    };

    // 添加手机号输入框
    const addPhoneInput = () => {
        setFormData(prev => ({
            ...prev,
            phones: [...prev.phones, '']
        }));
    };

    // 删除手机号输入框
    const removePhoneInput = (index: number) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.filter((_, i) => i !== index)
        }));
    };

    // 更新手机号
    const updatePhone = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            phones: prev.phones.map((phone, i) => i === index ? value : phone)
        }));
    };

    const handleCopy = (cardKey: LinkedCardKey, type: 'link' | 'key') => {
        const baseUrl = window.location.origin;
        const params = new URLSearchParams({
            cardkey: cardKey.key,
            ...(cardKey.phone ? { t: cardKey.phone } : {}),
            ...(cardKey.appName ? { appname: cardKey.appName } : {})
        });
        const fullUrl = `${baseUrl}/user/${username}/message?${params.toString()}`;

        if (copyToClipboard(fullUrl)) {
            setError('复制成功');
            setTimeout(() => setError(null), 2000);
        } else {
            setError('复制失败，请手动复制');
        }
    };

    useEffect(() => {
        fetchCardKeys();
    }, [username]);

    useEffect(() => {
        // 切换筛选状态时重置页码
        setCurrentPage(1);
    }, [filterStatus, searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    // 筛选和搜索逻辑
    const filteredCardKeys = cardKeys.filter(key => {
        const matchesStatus =
            filterStatus === 'all' ? true :
                filterStatus === 'used' ? key.usedAt !== null :
                    !key.usedAt;

        const matchesSearch = searchQuery
            ? key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (key.usedAt && new Date(key.usedAt).toLocaleString().toLowerCase().includes(searchQuery.toLowerCase()))
            : true;

        return matchesStatus && matchesSearch;
    });

    // 分页逻辑
    const totalPages = Math.ceil(filteredCardKeys.length / itemsPerPage);
    const paginatedCardKeys = filteredCardKeys.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <nav className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                带链接卡密管理 - {username}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push(`/user/${username}/cardkeys`)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                            >
                                普通卡密
                            </button>
                            <button
                                onClick={() => router.push(`/user/${username}`)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
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
                        {/* 生成卡密控制面板 */}
                        <div className="mb-8 border-b pb-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">生成带链接卡密</h3>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            生成数量
                                        </label>
                                        <select
                                            value={formData.count}
                                            onChange={(e) => setFormData(prev => ({ ...prev, count: Number(e.target.value) }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {[1, 5, 10, 20, 50, 100].map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            应用名称
                                        </label>
                                        <select
                                            value={formData.appName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            {APP_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="includePhone"
                                            checked={formData.linkParams.includePhone}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                linkParams: {
                                                    ...prev.linkParams,
                                                    includePhone: e.target.checked
                                                }
                                            }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="includePhone" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                            包含手机号
                                        </label>
                                    </div>

                                    {formData.linkParams.includePhone && (
                                        <div className="space-y-2">
                                            {formData.phones.map((phone, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        type="tel"
                                                        value={phone}
                                                        onChange={(e) => updatePhone(index, e.target.value)}
                                                        placeholder={`请输入第 ${index + 1} 个手机号`}
                                                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoneInput(index)}
                                                        className="px-2 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={addPhoneInput}
                                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                            >
                                                + 添加手机号
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center mt-2">
                                        <input
                                            type="checkbox"
                                            id="includeAppName"
                                            checked={formData.linkParams.includeAppName}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                linkParams: {
                                                    ...prev.linkParams,
                                                    includeAppName: e.target.checked
                                                }
                                            }))}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="includeAppName" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                            包含应用名称
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={generateLinkedCardKeys}
                                        disabled={generating}
                                        className={`px-4 py-2 rounded-md text-white transition-colors ${generating
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {generating ? '生成中...' : '生成带链接卡密'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className={`mb-6 p-4 rounded-md ${error.includes('成功')
                                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400'
                                }`}>
                                {error}
                            </div>
                        )}

                        {/* 搜索和筛选区域 */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="搜索卡密或使用时间..."
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-blue-500 border border-blue-500 hover:bg-blue-50'
                                        }`}
                                >
                                    全部
                                </button>
                                <button
                                    onClick={() => setFilterStatus('unused')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'unused'
                                        ? 'bg-green-500 text-white'
                                        : 'text-green-500 border border-green-500 hover:bg-green-50'
                                        }`}
                                >
                                    未使用
                                </button>
                                <button
                                    onClick={() => setFilterStatus('used')}
                                    className={`px-4 py-2 rounded-md transition-colors ${filterStatus === 'used'
                                        ? 'bg-gray-500 text-white'
                                        : 'text-gray-500 border border-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    已使用
                                </button>
                            </div>
                        </div>

                        {/* 卡密列表 */}
                        <div className="space-y-4">
                            {paginatedCardKeys.map((cardKey) => (
                                <div
                                    key={cardKey.id}
                                    className="p-6 border dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                                >
                                    <div className="space-y-4">
                                        {/* 状态标签和时间 */}
                                        <div className="flex justify-between items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${cardKey.usedAt
                                                    ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                    : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                                                }`}>
                                                {cardKey.usedAt ? '已使用' : '未使用'}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                创建于 {new Date(cardKey.createdAt).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* 链接展示区域 */}
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">分享链接</span>
                                                {!cardKey.usedAt && (
                                                    <button
                                                        onClick={() => handleCopy(cardKey, 'link')}
                                                        className="px-3 py-1 text-sm rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                                    >
                                                        复制链接
                                                    </button>
                                                )}
                                            </div>
                                            <div className="font-mono text-sm break-all text-gray-800 dark:text-gray-200">
                                                {`${window.location.origin}/user/${username}/message?cardkey=${cardKey.key}${cardKey.phone ? `&t=${cardKey.phone}` : ''}${cardKey.appName ? `&appname=${cardKey.appName}` : ''}`}
                                            </div>
                                        </div>

                                        {/* 卡密和应用信息 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t dark:border-gray-700">
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">卡密</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                                        {cardKey.key}
                                                    </div>
                                                    {!cardKey.usedAt && (
                                                        <button
                                                            onClick={() => handleCopy(cardKey, 'key')}
                                                            className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                        >
                                                            复制卡密
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                {cardKey.phone && (
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">手机号</div>
                                                        <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
                                                            {cardKey.phone}
                                                        </div>
                                                    </div>
                                                )}
                                                {cardKey.appName && (
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">应用</div>
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            {APP_OPTIONS.find(opt => opt.value === cardKey.appName)?.label || cardKey.appName}
                                                        </div>
                                                    </div>
                                                )}
                                                {cardKey.usedAt && (
                                                    <div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">使用时间</div>
                                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                                            {new Date(cardKey.usedAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredCardKeys.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed dark:border-gray-700 rounded-lg">
                                    {searchQuery ? '没有找到匹配的卡密' : '暂无卡密数据'}
                                </div>
                            )}
                        </div>

                        {/* 分页控制 */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    上一页
                                </button>
                                <span className="px-3 py-1">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
} 