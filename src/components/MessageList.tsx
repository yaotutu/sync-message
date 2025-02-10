'use client';

interface Product {
    id: string;
    title: string;
    imageUrl?: string;
    link: string;
    price?: number;
    description?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

interface MessageListProps {
    messages: Product[];
}

export default function MessageList({ messages }: MessageListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {messages.map((product) => (
                <div
                    key={product.id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                    {product.imageUrl && (
                        <div className="aspect-video relative overflow-hidden">
                            <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {product.title}
                        </h3>
                        {product.price !== undefined && (
                            <div className="text-red-500 font-bold mb-2">
                                ¥{product.price.toFixed(2)}
                            </div>
                        )}
                        {product.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                {product.description}
                            </p>
                        )}
                        {product.notes && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                                备注: {product.notes}
                            </p>
                        )}
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(product.createdAt).toLocaleDateString()}
                            </span>
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-md transition-colors"
                            >
                                查看详情
                            </a>
                        </div>
                    </div>
                </div>
            ))}
            {messages.length === 0 && (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8 border-2 border-dashed rounded-lg">
                    暂无产品信息
                </div>
            )}
        </div>
    );
}