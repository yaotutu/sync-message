'use client';

import React, { useEffect, useState } from 'react';
import { MessageTemplate, MessageRule, RuleType } from '@/lib/types/template';
import { toast } from 'sonner';

interface TemplateFormData {
    appName: string;
    helpDoc: string;
    rules: {
        ruleType: RuleType;
        pattern: string;
        description?: string;
        order: number;
    }[];
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<MessageTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<TemplateFormData>({
        appName: '',
        helpDoc: '',
        rules: []
    });

    // 获取模板列表
    const fetchTemplates = async () => {
        try {
            const response = await fetch('/api/manage/templates');
            const data = await response.json();

            if (data.success && data.data?.templates) {
                setTemplates(data.data.templates);
            }
        } catch (error) {
            console.error('获取模板列表失败:', error);
            toast.error('获取模板列表失败');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // 添加规则
    const handleAddRule = () => {
        setFormData(prev => ({
            ...prev,
            rules: [
                ...prev.rules,
                {
                    ruleType: 'CONTAINS',
                    pattern: '',
                    description: '',
                    order: prev.rules.length
                }
            ]
        }));
    };

    // 删除规则
    const handleRemoveRule = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    // 更新规则
    const handleRuleChange = (index: number, field: keyof MessageRule, value: string) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.map((rule, i) =>
                i === index ? { ...rule, [field]: value } : rule
            )
        }));
    };

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await fetch('/api/manage/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('模板创建成功');
                setShowForm(false);
                setFormData({
                    appName: '',
                    helpDoc: '',
                    rules: []
                });
                fetchTemplates();
            } else {
                toast.error(data.message || '创建失败');
            }
        } catch (error) {
            console.error('创建模板失败:', error);
            toast.error('创建模板失败');
        } finally {
            setIsCreating(false);
        }
    };

    // 删除模板
    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm('确定要删除此模板吗？')) {
            return;
        }

        try {
            const response = await fetch(`/api/manage/templates/${templateId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                toast.success('模板删除成功');
                fetchTemplates();
            } else {
                toast.error(data.message || '删除失败');
            }
        } catch (error) {
            console.error('删除模板失败:', error);
            toast.error('删除模板失败');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        消息模板管理
                    </h1>
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        创建模板
                    </button>
                </div>

                {showForm && (
                    <div className="mb-8 p-6 border rounded-lg">
                        <h2 className="text-xl font-semibold mb-4">创建新模板</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    应用名称
                                </label>
                                <input
                                    type="text"
                                    value={formData.appName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    帮助文档
                                </label>
                                <textarea
                                    value={formData.helpDoc}
                                    onChange={(e) => setFormData(prev => ({ ...prev, helpDoc: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-lg"
                                    rows={4}
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium">
                                        规则列表
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddRule}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        添加规则
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {formData.rules.map((rule, index) => (
                                        <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                                            <div className="flex-1">
                                                <select
                                                    value={rule.ruleType}
                                                    onChange={(e) => handleRuleChange(index, 'ruleType', e.target.value as RuleType)}
                                                    className="w-full px-3 py-2 border rounded-lg mb-2"
                                                >
                                                    <option value="CONTAINS">包含</option>
                                                    <option value="NOT_CONTAINS">不包含</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={rule.pattern}
                                                    onChange={(e) => handleRuleChange(index, 'pattern', e.target.value)}
                                                    placeholder="匹配模式"
                                                    className="w-full px-3 py-2 border rounded-lg mb-2"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={rule.description || ''}
                                                    onChange={(e) => handleRuleChange(index, 'description', e.target.value)}
                                                    placeholder="规则描述（可选）"
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRule(index)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                删除
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isCreating ? '创建中...' : '创建'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-semibold">
                                    {template.appName}
                                </h3>
                                <button
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    className="text-red-600 hover:text-red-700"
                                >
                                    删除
                                </button>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                {template.helpDoc}
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">规则列表：</h4>
                                {template.rules.map((rule, index) => (
                                    <div
                                        key={rule.id}
                                        className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                    >
                                        {rule.description || `${rule.ruleType === 'CONTAINS' ? '包含' : '不包含'} "${rule.pattern}"`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 