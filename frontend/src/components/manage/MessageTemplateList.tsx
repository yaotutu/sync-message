'use client';

import { MessageTemplate } from '@/types/manage';

interface MessageTemplateListProps {
    templates: MessageTemplate[];
    onRefresh: () => void;
    onDeleteTemplate: (id: number) => void;
}

export default function MessageTemplateList({
    templates,
    onRefresh,
    onDeleteTemplate
}: MessageTemplateListProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">消息模板列表</h2>
                <button
                    onClick={onRefresh}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                >
                    刷新列表
                </button>
            </div>
            <div className="space-y-3">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="p-4 bg-white rounded-lg border border-gray-200"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="font-medium text-gray-900">{template.name}</div>
                                <div className="text-sm text-gray-500">
                                    创建时间：{new Date(template.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <button
                                onClick={() => onDeleteTemplate(template.id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors text-sm"
                            >
                                删除
                            </button>
                        </div>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-gray-700 whitespace-pre-wrap">
                            {template.content}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 